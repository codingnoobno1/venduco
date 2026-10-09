package com.vendorconnect.persistence.jpa.adapter

import com.vendorconnect.application.port.outbound.AuditEntry
import com.vendorconnect.application.port.outbound.AuditLogPort
import com.vendorconnect.application.port.outbound.RoleAssignmentRepositoryPort
import com.vendorconnect.application.port.outbound.RoleRepositoryPort
import com.vendorconnect.domain.access.AccessLevel
import com.vendorconnect.domain.access.AssignmentSource
import com.vendorconnect.domain.access.AssignmentStatus
import com.vendorconnect.domain.access.Portal
import com.vendorconnect.domain.access.Role
import com.vendorconnect.domain.access.RoleAssignment
import com.vendorconnect.domain.access.ScopeLevel
import com.vendorconnect.domain.access.ScopeType
import com.vendorconnect.domain.shared.AuditInfo
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.persistence.jpa.entity.AuditLogJpaEntity
import com.vendorconnect.persistence.jpa.entity.RoleAssignmentJpaEntity
import com.vendorconnect.persistence.jpa.entity.RoleJpaEntity
import com.vendorconnect.persistence.jpa.repository.AuditLogJpaRepository
import com.vendorconnect.persistence.jpa.repository.RoleAssignmentJpaRepository
import com.vendorconnect.persistence.jpa.repository.RoleJpaRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.util.Currency
import java.util.UUID

@Component
class RoleRepositoryAdapter(private val jpa: RoleJpaRepository) : RoleRepositoryPort {

    override fun save(role: Role): Role = toDomain(jpa.save(toEntity(role)))

    override fun findById(id: UUID): Role? = jpa.findById(id).orElse(null)?.let(::toDomain)

    override fun findByKey(key: String): Role? = jpa.findByRoleKey(key)?.let(::toDomain)

    override fun findAllById(ids: Collection<UUID>): List<Role> = jpa.findAllById(ids).map(::toDomain)

    override fun findAll(): List<Role> = jpa.findAll().map(::toDomain)

    override fun deleteById(id: UUID) = jpa.deleteById(id)

    private fun toEntity(role: Role) = RoleJpaEntity(
        id = role.id,
        roleKey = role.key,
        name = role.name,
        description = role.description,
        portal = role.portal.name,
        scopeLevel = role.scopeLevel.name,
        isSystem = role.isSystem,
        organizationId = role.organizationId,
        defaultDashboardKey = role.defaultDashboardKey,
        isActive = role.isActive,
        permissions = role.permissions.toMutableSet(),
        createdAt = role.audit.createdAt,
        updatedAt = role.audit.updatedAt
    )

    private fun toDomain(entity: RoleJpaEntity) = Role(
        id = entity.id,
        key = entity.roleKey,
        name = entity.name,
        description = entity.description,
        portal = Portal.valueOf(entity.portal),
        scopeLevel = ScopeLevel.valueOf(entity.scopeLevel),
        isSystem = entity.isSystem,
        organizationId = entity.organizationId,
        defaultDashboardKey = entity.defaultDashboardKey,
        isActive = entity.isActive,
        permissions = entity.permissions.toSet(),
        audit = AuditInfo(createdAt = entity.createdAt, updatedAt = entity.updatedAt)
    )
}

@Component
class RoleAssignmentRepositoryAdapter(private val jpa: RoleAssignmentJpaRepository) : RoleAssignmentRepositoryPort {

    override fun save(assignment: RoleAssignment): RoleAssignment = toDomain(jpa.save(toEntity(assignment)))

    override fun findById(id: UUID): RoleAssignment? = jpa.findById(id).orElse(null)?.let(::toDomain)

    override fun findByUserId(userId: UUID): List<RoleAssignment> =
        jpa.findByUserIdOrderByCreatedAtAscIdAsc(userId).map(::toDomain)

    override fun findByRoleId(roleId: UUID): List<RoleAssignment> = jpa.findByRoleId(roleId).map(::toDomain)

    override fun findAll(): List<RoleAssignment> = jpa.findAll().map(::toDomain)

    override fun existsByUserId(userId: UUID): Boolean = jpa.existsByUserId(userId)

    private fun toEntity(a: RoleAssignment) = RoleAssignmentJpaEntity(
        id = a.id,
        userId = a.userId,
        roleId = a.roleId,
        organizationId = a.organizationId,
        projectId = a.projectId,
        scopeType = a.scopeType.name,
        scopeRefs = a.scopeRefs.toMutableSet(),
        accessLevel = a.accessLevel.name,
        approvalLimitMinor = a.approvalLimit?.toMinorUnits(),
        approvalLimitCurrency = a.approvalLimit?.currency?.currencyCode,
        reviewerUserId = a.reviewerUserId,
        validFrom = a.validFrom,
        validUntil = a.validUntil,
        status = a.status.name,
        source = a.source.name,
        createdBy = a.createdBy,
        createdAt = a.audit.createdAt,
        updatedAt = a.audit.updatedAt
    )

    private fun toDomain(e: RoleAssignmentJpaEntity) = RoleAssignment(
        id = e.id,
        userId = e.userId,
        roleId = e.roleId,
        organizationId = e.organizationId,
        projectId = e.projectId,
        scopeType = ScopeType.valueOf(e.scopeType),
        scopeRefs = e.scopeRefs.toSet(),
        accessLevel = AccessLevel.valueOf(e.accessLevel),
        approvalLimit = e.approvalLimitMinor?.let {
            Money.ofMinorUnits(it, Currency.getInstance(e.approvalLimitCurrency ?: Money.INR.currencyCode))
        },
        reviewerUserId = e.reviewerUserId,
        validFrom = e.validFrom,
        validUntil = e.validUntil,
        status = AssignmentStatus.valueOf(e.status),
        source = AssignmentSource.valueOf(e.source),
        createdBy = e.createdBy,
        audit = AuditInfo(createdAt = e.createdAt, updatedAt = e.updatedAt)
    )
}

@Component
class AuditLogAdapter(private val jpa: AuditLogJpaRepository) : AuditLogPort {

    override fun append(entry: AuditEntry) {
        jpa.save(
            AuditLogJpaEntity(entry.id, entry.occurredAt, entry.actorUserId, entry.assignmentId, entry.action,
                entry.entityType, entry.entityId, entry.summary)
        )
    }

    override fun findRecent(entityType: String?, entityId: String?, actorUserId: UUID?, limit: Int): List<AuditEntry> =
        jpa.search(entityType, entityId, actorUserId, PageRequest.of(0, limit)).map {
            AuditEntry(it.id, it.occurredAt, it.actorUserId, it.assignmentId, it.action, it.entityType, it.entityId, it.summary)
        }
}
