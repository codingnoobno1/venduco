package com.vendorconnect.application.usecase.user

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.PasswordHasherPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.auth.AuthUseCase
import com.vendorconnect.application.usecase.access.AccessProvisioningService
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.domain.shared.DuplicateEntityException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.InsufficientPermissionException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.SystemRoles
import com.vendorconnect.domain.user.User
import com.vendorconnect.domain.user.UserRole
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

/**
 * Admin operations on users: changing the legacy role and (de)activating accounts.
 * Callers hold `admin.user:manage` (checked at the delivery layer).
 */
@Service
class UserAdminUseCase(
    private val userRepository: UserRepositoryPort,
    private val passwordHasher: PasswordHasherPort,
    private val organizations: OrganizationDirectoryPort,
    private val provisioning: AccessProvisioningService,
    private val audit: AuditRecorder
) {

    data class UpdateUserCommand(
        val userId: UUID,
        val role: UserRole? = null,
        val active: Boolean? = null
    )

    data class CreateUserCommand(
        val email: String,
        val fullName: String,
        val password: String,
        val role: UserRole,
        val organizationId: UUID?
    )

    /** An account made by an administrator is approved from the start; the person is told their password out of band. */
    @Transactional
    fun createUser(ctx: AccessContext, command: CreateUserCommand): User {
        val email = AuthUseCase.normalizeEmail(command.email)
        requireDomain(EMAIL.matches(email)) { "Enter a valid email address." }
        requireDomain(command.fullName.isNotBlank()) { "Enter the person's name." }
        requireDomain(command.password.length >= MIN_INITIAL_PASSWORD_LENGTH &&
            command.password.toByteArray(Charsets.UTF_8).size <= AuthUseCase.MAX_PASSWORD_BYTES) {
            "The initial password must be $MIN_INITIAL_PASSWORD_LENGTH to ${AuthUseCase.MAX_PASSWORD_BYTES} characters."
        }
        requireMayGrant(ctx, command.role)
        command.organizationId?.let { organizations.findById(it) ?: throw EntityNotFoundException("Company", it) }
        if (userRepository.existsByEmail(email)) throw DuplicateEntityException("User", "email", email)

        val saved = userRepository.save(
            User(email = email, fullName = command.fullName.trim(), passwordHash = passwordHasher.hash(command.password),
                role = command.role, organizationId = command.organizationId)
        )
        provisioning.ensureDefaultAssignment(saved)
        audit.record(ctx, "USER_CREATED", ENTITY, saved.id, "Created ${saved.email} with base role ${saved.role}")
        return saved
    }

    @Transactional
    fun updateUser(ctx: AccessContext, command: UpdateUserCommand): User {
        requireDomain(command.role != null || command.active != null) { "Nothing to update: provide role and/or active" }
        // Prevents an admin from locking themselves (and possibly everyone) out.
        requireDomain(command.userId != ctx.userId) { "Admins cannot change their own role or status" }

        val user = userRepository.findById(command.userId)
            ?: throw EntityNotFoundException("User", command.userId)
        command.role?.takeIf { it != user.role }?.let { requireMayGrant(ctx, it) }

        val saved = userRepository.save(
            user.copy(
                role = command.role ?: user.role,
                isActive = command.active ?: user.isActive,
                audit = user.audit.copy(updatedAt = Instant.now(), updatedBy = ctx.userId.toString())
            )
        )
        if (saved.role != user.role) {
            // users.role is still what the frontend routes on; its assignment has to follow it.
            provisioning.syncLegacyRole(saved, ctx.userId)
            audit.record(ctx, "USER_ROLE_CHANGED", ENTITY, saved.id, "Role of ${saved.email}: ${user.role} → ${saved.role}")
        }
        if (saved.isActive != user.isActive) {
            audit.record(ctx, if (saved.isActive) "USER_ACTIVATED" else "USER_DEACTIVATED", ENTITY, saved.id,
                "${if (saved.isActive) "Activated" else "Deactivated"} ${saved.email}")
        }
        return saved
    }

    /**
     * A base role brings a role assignment with it, so handing one out is granting its permissions:
     * nobody may give a base role that carries more than they hold themselves.
     */
    private fun requireMayGrant(ctx: AccessContext, role: UserRole) {
        val beyond = (SystemRoles.forLegacy(role).permissions - ctx.permissions).sorted()
        if (beyond.isNotEmpty()) throw InsufficientPermissionException("give the base role $role (it grants ${beyond.joinToString()})")
    }

    private companion object {
        const val ENTITY = "USER"
        const val MIN_INITIAL_PASSWORD_LENGTH = 12
        val EMAIL = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    }
}
