package com.vendorconnect.application.usecase.access

import com.vendorconnect.application.port.outbound.RoleAssignmentRepositoryPort
import com.vendorconnect.application.port.outbound.RoleRepositoryPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.domain.access.AssignmentSource
import com.vendorconnect.domain.access.AssignmentStatus
import com.vendorconnect.domain.access.RoleAssignment
import com.vendorconnect.domain.access.SystemRoles
import com.vendorconnect.domain.shared.AuditInfo
import com.vendorconnect.domain.user.User
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

/**
 * Keeps the persisted access model in step with what the code defines and with the legacy
 * `users.role` column: system roles are rewritten from [SystemRoles], and every user gets an
 * assignment that mirrors their legacy role until that column is retired.
 */
@Service
class AccessProvisioningService(
    private val users: UserRepositoryPort,
    private val roles: RoleRepositoryPort,
    private val assignments: RoleAssignmentRepositoryPort
) {
    private val log = LoggerFactory.getLogger(javaClass)

    /** System roles are owned by the code, so a release that changes one updates the database on boot. */
    @Transactional
    fun seedSystemRoles() {
        SystemRoles.all.forEach { definition ->
            val existing = roles.findById(definition.id)
            if (existing == null || existing.copy(audit = definition.audit) != definition) {
                roles.save(
                    definition.copy(audit = AuditInfo(createdAt = existing?.audit?.createdAt ?: Instant.now(), updatedAt = Instant.now()))
                )
                log.info("{} system role {}", if (existing == null) "Created" else "Updated", definition.key)
            }
        }
    }

    /** For users that predate the access model or were inserted directly (seed scripts). */
    @Transactional
    fun backfillDefaultAssignments() {
        val created = users.findAll().count { ensureDefaultAssignment(it) }
        if (created > 0) log.info("Created default role assignments for {} user(s)", created)
    }

    /**
     * Gives a user with no assignments at all one that mirrors their legacy role.
     * A user whose assignments were all revoked is left alone: that was somebody's decision.
     */
    @Transactional
    fun ensureDefaultAssignment(user: User): Boolean {
        if (assignments.existsByUserId(user.id)) return false
        assignments.save(legacyAssignment(user, createdBy = null))
        return true
    }

    /** Call after `users.role` changes: swaps the mirrored assignment, leaves manual ones untouched. */
    @Transactional
    fun syncLegacyRole(user: User, actorId: UUID?) {
        val targetRoleId = SystemRoles.forLegacy(user.role).id
        val mirrored = assignments.findByUserId(user.id)
            .filter { it.source == AssignmentSource.LEGACY_ROLE && it.status != AssignmentStatus.REVOKED }

        mirrored.filter { it.roleId != targetRoleId }.forEach {
            assignments.save(it.copy(status = AssignmentStatus.REVOKED, audit = it.audit.copy(updatedAt = Instant.now())))
        }
        if (mirrored.none { it.roleId == targetRoleId }) {
            assignments.save(legacyAssignment(user, actorId))
        }
    }

    private fun legacyAssignment(user: User, createdBy: UUID?) = RoleAssignment(
        userId = user.id,
        roleId = SystemRoles.forLegacy(user.role).id,
        organizationId = user.organizationId,
        source = AssignmentSource.LEGACY_ROLE,
        createdBy = createdBy
    )
}
