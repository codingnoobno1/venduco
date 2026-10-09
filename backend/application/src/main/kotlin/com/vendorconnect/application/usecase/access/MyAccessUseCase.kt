package com.vendorconnect.application.usecase.access

import com.vendorconnect.application.port.outbound.ProjectRepositoryPort
import com.vendorconnect.application.port.outbound.RoleAssignmentRepositoryPort
import com.vendorconnect.application.port.outbound.RoleRepositoryPort
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.AssignmentStatus
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.access.Role
import com.vendorconnect.domain.access.RoleAssignment
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

/** What the signed-in user may act as: the data behind the Organisation / Project / Role switcher. */
@Service
class MyAccessUseCase(
    private val assignments: RoleAssignmentRepositoryPort,
    private val roles: RoleRepositoryPort,
    private val projects: ProjectRepositoryPort,
    private val resolver: AccessContextResolver
) {

    data class MyAssignment(val assignment: RoleAssignment, val role: Role, val projectName: String?, val usable: Boolean)

    data class MyContext(val assignments: List<MyAssignment>, val defaultAssignmentId: UUID?)

    data class MyAccess(val context: AccessContext, val role: Role, val assignment: RoleAssignment)

    /** Revoked assignments are omitted; suspended and expired ones are listed as not usable. */
    @Transactional(readOnly = true)
    fun context(userId: UUID): MyContext {
        val mine = assignments.findByUserId(userId).filter { it.status != AssignmentStatus.REVOKED }
        val rolesById = roles.findAllById(mine.mapTo(mutableSetOf()) { it.roleId }).associateBy { it.id }
        val projectNames = mine.mapNotNullTo(mutableSetOf()) { it.projectId }
            .associateWith { projects.findById(it)?.name }
        val today = LocalDate.now()

        val listed = mine.mapNotNull { a ->
            rolesById[a.roleId]?.let { role ->
                MyAssignment(a, role, a.projectId?.let(projectNames::get), role.isActive && a.isUsableOn(today))
            }
        }
        // Same rule as AccessContextResolver uses when no assignment is named: the oldest usable one.
        return MyContext(listed, listed.firstOrNull { it.usable }?.assignment?.id)
    }

    @Transactional(readOnly = true)
    fun access(userId: UUID, requestedAssignmentId: UUID?): MyAccess {
        val context = resolver.resolve(userId, requestedAssignmentId)
        return MyAccess(context, roles.findById(context.roleId)!!, assignments.findById(context.assignmentId)!!)
    }

    /**
     * The assignment a user administers under: their oldest usable one that carries any `admin.*`
     * permission, or null if they are not an administrator.
     */
    @Transactional(readOnly = true)
    fun adminAssignmentId(userId: UUID): UUID? {
        val today = LocalDate.now()
        return assignments.findByUserId(userId).firstOrNull { assignment ->
            assignment.isUsableOn(today) && roles.findById(assignment.roleId)?.takeIf { it.isActive }
                ?.let { role -> Permissions.effective(role.permissions, assignment.accessLevel).any { it.startsWith("admin.") } } == true
        }?.id
    }
}
