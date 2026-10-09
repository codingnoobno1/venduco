package com.vendorconnect.application.usecase.access

import com.vendorconnect.application.port.outbound.RoleAssignmentRepositoryPort
import com.vendorconnect.application.port.outbound.RoleRepositoryPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.account.AccountStandingService
import com.vendorconnect.domain.shared.AccountDisabledException
import com.vendorconnect.domain.shared.AssignmentInvalidException
import com.vendorconnect.domain.shared.InvalidTokenException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.access.Role
import com.vendorconnect.domain.access.RoleAssignment
import com.vendorconnect.domain.access.ScopeLevel
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

/**
 * Turns "this user, optionally this assignment" into the [AccessContext] a request runs under.
 *
 * Everything is read from the database on each call, so suspending a user, ending an assignment or
 * editing a role takes effect on the next request rather than when the access token expires.
 * The same goes for approval and subscription payment, which are checked here too.
 */
@Service
class AccessContextResolver(
    private val users: UserRepositoryPort,
    private val roles: RoleRepositoryPort,
    private val assignments: RoleAssignmentRepositoryPort,
    private val standing: AccountStandingService
) {

    /**
     * @param requestedAssignmentId the assignment the client asked to act under, or null to use the
     *   user's oldest usable one. A requested assignment that is not the caller's is reported exactly
     *   like one that does not exist.
     */
    @Transactional(readOnly = true)
    fun resolve(userId: UUID, requestedAssignmentId: UUID?): AccessContext {
        val user = users.findById(userId) ?: throw InvalidTokenException()
        if (!user.isActive) throw AccountDisabledException()

        val today = LocalDate.now()
        val candidates = if (requestedAssignmentId != null) {
            listOfNotNull(assignments.findById(requestedAssignmentId)?.takeIf { it.userId == userId })
        } else {
            assignments.findByUserId(userId)
        }

        for (assignment in candidates) {
            if (!assignment.isUsableOn(today)) continue
            val role = roles.findById(assignment.roleId)?.takeIf { it.isActive } ?: continue
            // Checked after the assignment is known: platform staff are not subject to a company's approval or billing.
            standing.requireGoodStanding(user, platformStaff = role.scopeLevel == ScopeLevel.PLATFORM)
            return contextOf(assignment, role)
        }
        throw AssignmentInvalidException()
    }

    fun contextOf(assignment: RoleAssignment, role: Role) = AccessContext(
        userId = assignment.userId,
        assignmentId = assignment.id,
        roleId = role.id,
        roleKey = role.key,
        organizationId = assignment.organizationId,
        projectId = assignment.projectId,
        permissions = Permissions.effective(role.permissions, assignment.accessLevel),
        scope = assignment.scope(),
        accessLevel = assignment.accessLevel,
        approvalLimit = assignment.approvalLimit,
        reviewerUserId = assignment.reviewerUserId
    )
}
