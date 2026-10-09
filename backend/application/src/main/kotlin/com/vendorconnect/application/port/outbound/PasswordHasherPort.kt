package com.vendorconnect.application.port.outbound

/**
 * Port for password hashing.
 * Phase 1: BcryptPasswordHasher (Spring Security BCrypt)
 */
interface PasswordHasherPort {
    fun hash(rawPassword: String): String
    fun matches(rawPassword: String, passwordHash: String): Boolean
}
