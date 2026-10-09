package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.user.User
import java.util.UUID

/**
 * Port for user persistence.
 * The domain/application layer programs against this interface.
 * Infrastructure layer provides the implementation (SQLite, PostgreSQL, etc.).
 */
interface UserRepositoryPort {
    fun save(user: User): User
    fun findById(id: UUID): User?
    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean
    fun findAll(): List<User>
    fun deleteById(id: UUID)
}
