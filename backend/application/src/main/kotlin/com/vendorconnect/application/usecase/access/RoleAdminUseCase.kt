package com.vendorconnect.application.usecase.access

import com.vendorconnect.application.port.outbound.RoleAssignmentRepositoryPort
import com.vendorconnect.application.port.outbound.RoleRepositoryPort
import com.vendorconnect.domain.shared.ConflictException
import com.vendorconnect.domain.shared.DuplicateEntityException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.InsufficientPermissionException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.AssignmentStatus
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.access.Portal
import com.vendorconnect.domain.access.Role
import com.vendorconnect.domain.access.ScopeLevel
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

/**
 * Administration of roles. Callers hold `admin.role:manage` (checked at the delivery layer);
 * the rules here are the ones that permission alone does not cover.
 */
@Service
class RoleAdminUseCase(
    private val roles: RoleRepositoryPort,
    private val assignments: RoleAssignmentRepositoryPort,
    private val audit: AuditRecorder
) {

    data class CreateRoleCommand(
        val key: String,
        val name: String,
        val description: String?,
        val portal: Portal,
        val scopeLevel: ScopeLevel,
        val permissions: Set<String>,
        val defaultDashboardKey: String?
    )

    /** Portal and scope level are fixed at creation: existing assignments were validated against them. */
    data class UpdateRoleCommand(
        val name: String,
        val description: String?,
        val permissions: Set<String>,
        val defaultDashboardKey: String?,
        val active: Boolean
    )

    @Transactional(readOnly = true)
    fun list(): List<Role> = roles.findAll().sortedWith(compareByDescending<Role> { it.isSystem }.thenBy { it.name })

    @Transactional(readOnly = true)
    fun get(id: UUID): Role = roles.findById(id) ?: throw EntityNotFoundException("Role", id)

    @Transactional
    fun create(ctx: AccessContext, command: CreateRoleCommand): Role {
        val key = command.key.trim()
        requireDomain(ROLE_KEY.matches(key)) { "Role key must be 3-49 characters: capital letters, digits and underscores, starting with a letter" }
        requireGrantable(ctx, command.permissions)
        if (roles.findByKey(key) != null) throw DuplicateEntityException("Role", "key", key)

        val saved = roles.save(
            Role(
                key = key,
                name = command.name.trim(),
                description = command.description?.trim()?.ifEmpty { null },
                portal = command.portal,
                scopeLevel = command.scopeLevel,
                permissions = command.permissions,
                defaultDashboardKey = command.defaultDashboardKey
            )
        )
        audit.record(ctx, "ROLE_CREATED", ENTITY, saved.id, "Created role ${saved.key} with ${saved.permissions.size} permission(s)")
        return saved
    }

    @Transactional
    fun update(ctx: AccessContext, id: UUID, command: UpdateRoleCommand): Role {
        val role = get(id)
        requireCustom(role)
        // Only what is being added needs to be grantable: an admin may tidy a role that holds more than they do.
        requireGrantable(ctx, command.permissions - role.permissions)
        requireKnown(command.permissions)

        val saved = roles.save(
            role.copy(
                name = command.name.trim(),
                description = command.description?.trim()?.ifEmpty { null },
                permissions = command.permissions,
                defaultDashboardKey = command.defaultDashboardKey,
                isActive = command.active,
                audit = role.audit.copy(updatedAt = Instant.now(), updatedBy = ctx.userId.toString())
            )
        )
        val added = (saved.permissions - role.permissions).sorted()
        val removed = (role.permissions - saved.permissions).sorted()
        audit.record(ctx, "ROLE_UPDATED", ENTITY, saved.id,
            "Updated role ${saved.key}: added $added, removed $removed, active=${saved.isActive}")
        return saved
    }

    @Transactional
    fun clone(ctx: AccessContext, sourceId: UUID, key: String, name: String): Role {
        val source = get(sourceId)
        return create(
            ctx,
            CreateRoleCommand(key, name, source.description, source.portal, source.scopeLevel, source.permissions,
                source.defaultDashboardKey)
        )
    }

    @Transactional
    fun delete(ctx: AccessContext, id: UUID) {
        val role = get(id)
        requireCustom(role)
        val inUse = assignments.findByRoleId(id).count { it.status != AssignmentStatus.REVOKED }
        if (inUse > 0) throw ConflictException("Role ${role.key} still has $inUse assignment(s); end them or deactivate the role instead")

        // Revoked assignments keep their role_id for history, so the row cannot simply disappear.
        if (assignments.findByRoleId(id).isNotEmpty()) {
            roles.save(role.copy(isActive = false, audit = role.audit.copy(updatedAt = Instant.now())))
            audit.record(ctx, "ROLE_DEACTIVATED", ENTITY, id, "Deactivated role ${role.key} (kept for assignment history)")
        } else {
            roles.deleteById(id)
            audit.record(ctx, "ROLE_DELETED", ENTITY, id, "Deleted role ${role.key}")
        }
    }

    private fun requireCustom(role: Role) {
        if (role.isSystem) throw ConflictException("System role ${role.key} is read-only; clone it to customise")
    }

    private fun requireKnown(permissions: Set<String>) {
        val unknown = Permissions.unknown(permissions)
        requireDomain(unknown.isEmpty()) { "Unknown permission(s): ${unknown.joinToString()}" }
    }

    /** Nobody can put into a role a permission they do not hold themselves. */
    private fun requireGrantable(ctx: AccessContext, permissions: Set<String>) {
        requireKnown(permissions)
        val beyond = (permissions - ctx.permissions).sorted()
        if (beyond.isNotEmpty()) throw InsufficientPermissionException("grant ${beyond.joinToString()}")
    }

    private companion object {
        const val ENTITY = "ROLE"
        val ROLE_KEY = Regex("^[A-Z][A-Z0-9_]{2,48}$")
    }
}
