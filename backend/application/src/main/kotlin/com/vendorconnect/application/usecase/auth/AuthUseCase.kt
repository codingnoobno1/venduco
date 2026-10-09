package com.vendorconnect.application.usecase.auth

import com.vendorconnect.application.port.outbound.EventPublisherPort
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.PasswordHasherPort
import com.vendorconnect.application.port.outbound.TokenServicePort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AccessProvisioningService
import com.vendorconnect.application.usecase.account.PlatformSettingsService
import com.vendorconnect.domain.event.UserRegisteredEvent
import com.vendorconnect.domain.shared.AccountDisabledException
import com.vendorconnect.domain.shared.DuplicateEntityException
import com.vendorconnect.domain.shared.InvalidCredentialsException
import com.vendorconnect.domain.shared.InvalidTokenException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.user.User
import com.vendorconnect.domain.user.UserRole
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Authentication use case.
 * Orchestrates login, registration and token refresh — programs against port interfaces only.
 */
@Service
class AuthUseCase(
    private val userRepository: UserRepositoryPort,
    private val passwordHasher: PasswordHasherPort,
    private val tokenService: TokenServicePort,
    private val eventPublisher: EventPublisherPort,
    private val provisioning: AccessProvisioningService,
    private val organizations: OrganizationDirectoryPort,
    private val settings: PlatformSettingsService
) {

    /** Self-registration always creates a VENDOR. Other roles are assigned by an admin. */
    data class RegisterCommand(
        val email: String,
        val fullName: String,
        val password: String,
        /** Set when registering a company: the company is created and this user becomes its first member. */
        val companyName: String? = null
    )

    data class LoginCommand(val email: String, val password: String)

    data class AuthResult(
        val accessToken: String,
        val refreshToken: String,
        val user: User
    )

    /** Compared against when the email is unknown, so both failure paths take the same time. */
    private val dummyHash: String by lazy { passwordHasher.hash("timing-equaliser-not-a-real-password") }

    @Transactional
    fun register(command: RegisterCommand): AuthResult {
        val email = normalizeEmail(command.email)
        requireDomain(command.password.toByteArray(Charsets.UTF_8).size <= MAX_PASSWORD_BYTES) {
            "Password must be at most $MAX_PASSWORD_BYTES bytes"
        }
        if (userRepository.existsByEmail(email)) {
            throw DuplicateEntityException("User", "email", email)
        }

        // Without automatic approval a new company and its first user both wait; approving the company approves both.
        val approval = if (settings.current().autoApproveRegistrations) ApprovalStatus.APPROVED else ApprovalStatus.PENDING
        val companyName = command.companyName?.trim()?.takeIf { it.isNotEmpty() }
        requireDomain(companyName == null || companyName.length in 2..MAX_COMPANY_NAME_LENGTH) {
            "Company name must be 2 to $MAX_COMPANY_NAME_LENGTH characters"
        }
        val company = companyName?.let { organizations.create(it, SELF_REGISTERED_COMPANY_TYPE, approval) }

        val savedUser = userRepository.save(
            User(
                email = email,
                fullName = command.fullName.trim(),
                passwordHash = passwordHasher.hash(command.password),
                role = UserRole.VENDOR,
                organizationId = company?.id,
                approvalStatus = approval
            )
        )
        eventPublisher.publish(UserRegisteredEvent(savedUser.id, savedUser.role.name))

        return issueTokens(savedUser)
    }

    // Not read-only: a user without any role assignment is given their default one here.
    @Transactional
    fun login(command: LoginCommand): AuthResult = issueTokens(verifyCredentials(command))

    /** Checks email and password without issuing tokens, for sign-ins that keep a server session instead. */
    @Transactional
    fun verifyCredentials(command: LoginCommand): User {
        val user = userRepository.findByEmail(normalizeEmail(command.email))
        val passwordMatches = passwordHasher.matches(command.password, user?.passwordHash ?: dummyHash)

        if (user == null || !passwordMatches) throw InvalidCredentialsException()
        if (!user.isActive) throw AccountDisabledException()

        provisioning.ensureDefaultAssignment(user)
        return user
    }

    /** Re-reads the user, so role changes and deactivation take effect at the next refresh. */
    @Transactional
    fun refresh(refreshToken: String): AuthResult {
        val userId = tokenService.parseRefreshToken(refreshToken) ?: throw InvalidTokenException()
        val user = userRepository.findById(userId) ?: throw InvalidTokenException()
        if (!user.isActive) throw AccountDisabledException()

        return issueTokens(user)
    }

    private fun issueTokens(user: User): AuthResult {
        provisioning.ensureDefaultAssignment(user)
        return AuthResult(
            accessToken = tokenService.issueAccessToken(user),
            refreshToken = tokenService.issueRefreshToken(user.id),
            user = user
        )
    }

    companion object {
        /** BCrypt only uses the first 72 bytes of a password and newer Spring Security rejects longer ones. */
        const val MAX_PASSWORD_BYTES = 72
        const val MAX_COMPANY_NAME_LENGTH = 160
        const val SELF_REGISTERED_COMPANY_TYPE = "VENDOR"

        fun normalizeEmail(email: String): String = email.trim().lowercase()
    }
}
