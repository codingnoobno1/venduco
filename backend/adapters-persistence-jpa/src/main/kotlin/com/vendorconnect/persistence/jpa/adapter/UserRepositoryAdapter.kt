package com.vendorconnect.persistence.jpa.adapter

import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.shared.AuditInfo
import com.vendorconnect.domain.user.User
import com.vendorconnect.domain.user.UserRole
import com.vendorconnect.persistence.jpa.entity.UserJpaEntity
import com.vendorconnect.persistence.jpa.repository.UserJpaRepository
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Adapter: bridges the JPA repository to the domain's UserRepositoryPort.
 * This is the ONLY class that knows about both JPA entities and domain models.
 */
@Component
class UserRepositoryAdapter(
    private val jpaRepository: UserJpaRepository
) : UserRepositoryPort {

    override fun save(user: User): User {
        val entity = toEntity(user)
        val saved = jpaRepository.save(entity)
        return toDomain(saved)
    }

    override fun findById(id: UUID): User? {
        return jpaRepository.findById(id).orElse(null)?.let { toDomain(it) }
    }

    override fun findByEmail(email: String): User? {
        return jpaRepository.findByEmail(email)?.let { toDomain(it) }
    }

    override fun existsByEmail(email: String): Boolean {
        return jpaRepository.existsByEmail(email)
    }

    override fun findAll(): List<User> {
        return jpaRepository.findAll().map { toDomain(it) }
    }

    override fun deleteById(id: UUID) {
        jpaRepository.deleteById(id)
    }

    // ── Mappers ──

    private fun toEntity(user: User): UserJpaEntity = UserJpaEntity(
        id = user.id,
        email = user.email,
        fullName = user.fullName,
        passwordHash = user.passwordHash,
        role = user.role.name,
        organizationId = user.organizationId,
        isActive = user.isActive,
        approvalStatus = user.approvalStatus.name,
        approvalNote = user.approvalNote,
        createdAt = user.audit.createdAt,
        updatedAt = user.audit.updatedAt
    )

    private fun toDomain(entity: UserJpaEntity): User = User(
        id = entity.id,
        email = entity.email,
        fullName = entity.fullName,
        passwordHash = entity.passwordHash,
        role = UserRole.valueOf(entity.role),
        organizationId = entity.organizationId,
        isActive = entity.isActive,
        approvalStatus = ApprovalStatus.valueOf(entity.approvalStatus),
        approvalNote = entity.approvalNote,
        audit = AuditInfo(
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    )
}
