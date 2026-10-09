package com.vendorconnect.security

import com.vendorconnect.application.port.outbound.PasswordHasherPort
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

/**
 * Adapter: exposes Spring Security's [PasswordEncoder] (BCrypt, see [SecurityConfig]) as a domain port.
 */
@Component
class BcryptPasswordHasher(
    private val passwordEncoder: PasswordEncoder
) : PasswordHasherPort {

    override fun hash(rawPassword: String): String = passwordEncoder.encode(rawPassword)

    override fun matches(rawPassword: String, passwordHash: String): Boolean =
        passwordEncoder.matches(rawPassword, passwordHash)
}
