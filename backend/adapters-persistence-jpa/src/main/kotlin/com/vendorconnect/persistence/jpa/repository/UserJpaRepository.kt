package com.vendorconnect.persistence.jpa.repository

import com.vendorconnect.persistence.jpa.entity.UserJpaEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for users.
 * This is a raw data access interface — the adapter wraps it to match the domain port.
 */
@Repository
interface UserJpaRepository : JpaRepository<UserJpaEntity, UUID> {
    fun findByEmail(email: String): UserJpaEntity?
    fun existsByEmail(email: String): Boolean
}
