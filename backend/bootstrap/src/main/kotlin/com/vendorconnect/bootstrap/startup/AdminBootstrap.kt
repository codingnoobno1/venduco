package com.vendorconnect.bootstrap.startup

import com.vendorconnect.application.port.outbound.PasswordHasherPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AccessProvisioningService
import com.vendorconnect.application.usecase.auth.AuthUseCase
import com.vendorconnect.domain.user.User
import com.vendorconnect.domain.user.UserRole
import com.vendorconnect.application.config.AppProperties
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

/**
 * Creates the first ADMIN account from VC_ADMIN_EMAIL / VC_ADMIN_PASSWORD, since
 * self-registration can no longer choose a role. Does nothing if either is unset
 * or the account already exists (an existing account is never modified).
 */
@Component
@Order(AccessBootstrap.ORDER + 1)  // needs the PLATFORM_ADMIN role to exist
class AdminBootstrap(
    private val properties: AppProperties,
    private val userRepository: UserRepositoryPort,
    private val passwordHasher: PasswordHasherPort,
    private val provisioning: AccessProvisioningService
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun run(args: ApplicationArguments) {
        val config = properties.bootstrap
        if (config.adminEmail.isBlank() || config.adminPassword.isBlank()) return

        val email = AuthUseCase.normalizeEmail(config.adminEmail)
        val existing = userRepository.findByEmail(email)
        if (existing != null) {
            if (existing.role != UserRole.ADMIN) {
                log.warn("Bootstrap admin {} already exists with role {}; leaving it unchanged", email, existing.role)
            }
            return
        }

        require(config.adminPassword.length >= MIN_ADMIN_PASSWORD_LENGTH) {
            "VC_ADMIN_PASSWORD must be at least $MIN_ADMIN_PASSWORD_LENGTH characters"
        }
        val admin = userRepository.save(
            User(
                email = email,
                fullName = config.adminName,
                passwordHash = passwordHasher.hash(config.adminPassword),
                role = UserRole.ADMIN
            )
        )
        provisioning.ensureDefaultAssignment(admin)
        log.info("Created bootstrap admin account {}", email)
    }

    private companion object {
        const val MIN_ADMIN_PASSWORD_LENGTH = 12
    }
}
