package com.vendorconnect.application.usecase.access

import com.vendorconnect.application.port.outbound.ProjectRepositoryPort
import com.vendorconnect.application.port.outbound.RoleAssignmentRepositoryPort
import com.vendorconnect.application.port.outbound.RoleRepositoryPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.domain.shared.ConflictException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.InsufficientPermissionException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.AccessLevel
import com.vendorconnect.domain.access.AssignmentStatus
import com.vendorconnect.domain.access.Role
import com.vendorconnect.domain.access.RoleAssignment
import com.vendorconnect.domain.access.ScopeLevel
import com.vendorconnect.domain.access.ScopeType
import com.vendorconnect.domain.access.SystemRoles
import com.vendorconnect.domain.shared.Money
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * Administration of role assignments. Callers hold `admin.assignment:manage`
 * (checked at the delivery layer).
 */
@Service
class AssignmentAdminUseCase(
    private val assignments: RoleAssignmentRepositoryPort,
    private val roles: RoleRepositoryPort,
    private val users: UserRepositoryPort,
    private val projects: ProjectRepositoryPort,
    private val resolver: AccessContextResolver,
    private val audit: AuditRecorder
) {

    data class CreateAssignmentCommand(
        val userId: UUID,
        val roleId: UUID,
        val organizationId: UUID?,
        val projectId: UUID?,
        val scopeType: ScopeType,
        val scopeRefs: Set<String>,
        val accessLevel: AccessLevel,
        val approvalLimit: Money?,
        val reviewerUserId: UUID?,
        val validFrom: LocalDate,
        val validUntil: LocalDate?
    )

    /** Null means "leave as is". Use the `clear…` flags to remove an optional value. */
    data class UpdateAssignmentCommand(
        val accessLevel: AccessLevel? = null,
        val approvalLimit: Money? = null,
        val clearApprovalLimit: Boolean = false,
        val reviewerUserId: UUID? = null,
        val clearReviewer: Boolean = false,
        val validUntil: LocalDate? = null,
        val clearValidUntil: Boolean = false,
        val suspended: Boolean? = null
    )

    data class AssignmentView(val assignment: RoleAssignment, val role: Role, val usable: Boolean)

    @Transactional(readOnly = true)
    fun list(userId: UUID?, roleId: UUID?, projectId: UUID?): List<AssignmentView> {
        val found = when {
            userId != null -> assignments.findByUserId(userId)
            roleId != null -> assignments.findByRoleId(roleId)
            else -> assignments.findAll()
        }.filter { (roleId == null || it.roleId == roleId) && (projectId == null || it.projectId == projectId) }
        return views(found)
    }

    @Transactional(readOnly = true)
    fun get(id: UUID): AssignmentView = views(listOf(find(id))).single()

    /** What the server would allow under this assignment right now, for "why can't X see Y?". */
    @Transactional(readOnly = true)
    fun effectiveAccess(id: UUID): Pair<AssignmentView, AccessContext> {
        val view = get(id)
        return view to resolver.contextOf(view.assignment, view.role)
    }

    @Transactional
    fun create(ctx: AccessContext, command: CreateAssignmentCommand): AssignmentView {
        val role = roles.findById(command.roleId)?.takeIf { it.isActive } ?: throw EntityNotFoundException("Role", command.roleId)
        val user = users.findById(command.userId) ?: throw EntityNotFoundException("User", command.userId)
        requireGrantable(ctx, role)
        requireScopeMatchesRole(role, command)
        command.projectId?.let { projects.findById(it) ?: throw EntityNotFoundException("Project", it) }
        requireValidReviewer(command.reviewerUserId, command.userId)
        requireDomain(command.validUntil == null || !command.validUntil.isBefore(command.validFrom)) {
            "validUntil cannot be before validFrom"
        }

        val saved = assignments.save(
            RoleAssignment(
                userId = command.userId,
                roleId = role.id,
                organizationId = command.organizationId,
                projectId = command.projectId,
                scopeType = command.scopeType,
                scopeRefs = command.scopeRefs,
                accessLevel = command.accessLevel,
                approvalLimit = command.approvalLimit,
                reviewerUserId = command.reviewerUserId,
                validFrom = command.validFrom,
                validUntil = command.validUntil,
                createdBy = ctx.userId
            )
        )
        audit.record(ctx, "ASSIGNMENT_CREATED", ENTITY, saved.id,
            "Assigned ${role.key} to ${user.email} (scope ${saved.scopeType}, level ${saved.accessLevel}, until ${saved.validUntil ?: "open"})")
        return AssignmentView(saved, role, saved.isUsableOn(LocalDate.now()))
    }

    @Transactional
    fun update(ctx: AccessContext, id: UUID, command: UpdateAssignmentCommand): AssignmentView {
        val current = find(id)
        if (current.status == AssignmentStatus.REVOKED) throw ConflictException("Assignment $id was revoked and cannot be changed")
        requireNotOwnActingAssignment(ctx, id)

        val validUntil = if (command.clearValidUntil) null else command.validUntil ?: current.validUntil
        requireDomain(validUntil == null || !validUntil.isBefore(current.validFrom)) { "validUntil cannot be before validFrom" }
        val reviewer = if (command.clearReviewer) null else command.reviewerUserId ?: current.reviewerUserId
        if (reviewer != current.reviewerUserId) requireValidReviewer(reviewer, current.userId)

        val updated = current.copy(
            accessLevel = command.accessLevel ?: current.accessLevel,
            approvalLimit = if (command.clearApprovalLimit) null else command.approvalLimit ?: current.approvalLimit,
            reviewerUserId = reviewer,
            validUntil = validUntil,
            status = when (command.suspended) {
                true -> AssignmentStatus.SUSPENDED
                false -> AssignmentStatus.ACTIVE
                null -> current.status
            },
            audit = current.audit.copy(updatedAt = Instant.now(), updatedBy = ctx.userId.toString())
        )
        if (updated.accessLevel != current.accessLevel || updated.status == AssignmentStatus.ACTIVE && current.status != AssignmentStatus.ACTIVE) {
            // Raising the level or lifting a suspension hands out authority, so it is checked like a new grant.
            requireGrantable(ctx, roles.findById(current.roleId) ?: throw EntityNotFoundException("Role", current.roleId))
        }
        requirePlatformAdminRemains(current, updated)

        val saved = assignments.save(updated)
        audit.record(ctx, "ASSIGNMENT_UPDATED", ENTITY, id,
            "level ${current.accessLevel}→${saved.accessLevel}, status ${current.status}→${saved.status}, until ${current.validUntil ?: "open"}→${saved.validUntil ?: "open"}")
        return views(listOf(saved)).single()
    }

    /** Ends an assignment for good. The row is kept so history and audit entries still resolve. */
    @Transactional
    fun revoke(ctx: AccessContext, id: UUID) {
        val current = find(id)
        if (current.status == AssignmentStatus.REVOKED) return
        requireNotOwnActingAssignment(ctx, id)
        val revoked = current.copy(
            status = AssignmentStatus.REVOKED,
            audit = current.audit.copy(updatedAt = Instant.now(), updatedBy = ctx.userId.toString())
        )
        requirePlatformAdminRemains(current, revoked)
        assignments.save(revoked)
        audit.record(ctx, "ASSIGNMENT_REVOKED", ENTITY, id, "Revoked assignment of role ${current.roleId} from user ${current.userId}")
    }

    private fun find(id: UUID) = assignments.findById(id) ?: throw EntityNotFoundException("Assignment", id)

    private fun views(found: List<RoleAssignment>): List<AssignmentView> {
        val rolesById = roles.findAllById(found.mapTo(mutableSetOf()) { it.roleId }).associateBy { it.id }
        val today = LocalDate.now()
        return found.mapNotNull { a ->
            rolesById[a.roleId]?.let { role -> AssignmentView(a, role, role.isActive && a.isUsableOn(today)) }
        }
    }

    /** Nobody can hand out a role that carries more than they hold themselves. */
    private fun requireGrantable(ctx: AccessContext, role: Role) {
        val beyond = (role.permissions - ctx.permissions).sorted()
        if (beyond.isNotEmpty()) throw InsufficientPermissionException("assign role ${role.key} (it grants ${beyond.joinToString()})")
    }

    private fun requireScopeMatchesRole(role: Role, c: CreateAssignmentCommand) {
        val expected = when (role.scopeLevel) {
            ScopeLevel.DISCIPLINE -> ScopeType.DISCIPLINE
            ScopeLevel.PACKAGE -> ScopeType.PACKAGE
            ScopeLevel.SECTION -> ScopeType.SECTION
            else -> ScopeType.ALL
        }
        requireDomain(c.scopeType == expected) { "Role ${role.key} is assigned at ${role.scopeLevel} level, so scopeType must be $expected" }
        requireDomain((expected == ScopeType.ALL) == c.scopeRefs.isEmpty()) {
            if (expected == ScopeType.ALL) "scopeRefs must be empty for role ${role.key}" else "scopeRefs must list at least one ${expected.name.lowercase()}"
        }
        if (expected == ScopeType.PACKAGE || expected == ScopeType.SECTION) {
            requireDomain(c.scopeRefs.all { runCatching { UUID.fromString(it) }.isSuccess }) { "scopeRefs must be ids for scope type $expected" }
        }
        when (role.scopeLevel) {
            ScopeLevel.PLATFORM -> requireDomain(c.organizationId == null && c.projectId == null) {
                "A platform role cannot be limited to an organization or project"
            }
            ScopeLevel.ORGANIZATION -> requireDomain(c.organizationId != null && c.projectId == null) {
                "Role ${role.key} needs an organizationId and no projectId"
            }
            else -> requireDomain(c.projectId != null) { "Role ${role.key} needs a projectId" }
        }
    }

    private fun requireValidReviewer(reviewerUserId: UUID?, assigneeId: UUID) {
        if (reviewerUserId == null) return
        requireDomain(reviewerUserId != assigneeId) { "A user cannot be their own reviewer" }
        users.findById(reviewerUserId) ?: throw EntityNotFoundException("User", reviewerUserId)
    }

    /** Changing the assignment you are acting under could lock you out mid-session. */
    private fun requireNotOwnActingAssignment(ctx: AccessContext, id: UUID) {
        if (ctx.assignmentId == id) throw ConflictException("You cannot change the assignment you are currently acting under")
    }

    /** The platform must never be left without a working administrator. */
    private fun requirePlatformAdminRemains(before: RoleAssignment, after: RoleAssignment) {
        val adminRoleId = SystemRoles.idOf(SystemRoles.PLATFORM_ADMIN)
        val today = LocalDate.now()
        fun RoleAssignment.isWorkingAdmin() = roleId == adminRoleId && accessLevel == AccessLevel.FULL && isUsableOn(today)
        if (!before.isWorkingAdmin() || after.isWorkingAdmin()) return

        val another = assignments.findByRoleId(adminRoleId).any {
            it.id != before.id && it.isWorkingAdmin() && users.findById(it.userId)?.isActive == true
        }
        if (!another) throw ConflictException("This is the last working platform administrator assignment")
    }

    private companion object {
        const val ENTITY = "ROLE_ASSIGNMENT"
    }
}
