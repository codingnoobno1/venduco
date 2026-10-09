package com.vendorconnect.persistence.jpa.repository

import com.vendorconnect.persistence.jpa.entity.AuditLogJpaEntity
import com.vendorconnect.persistence.jpa.entity.RoleAssignmentJpaEntity
import com.vendorconnect.persistence.jpa.entity.RoleJpaEntity
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RoleJpaRepository : JpaRepository<RoleJpaEntity, UUID> {
    fun findByRoleKey(roleKey: String): RoleJpaEntity?
}

@Repository
interface RoleAssignmentJpaRepository : JpaRepository<RoleAssignmentJpaEntity, UUID> {
    fun findByUserIdOrderByCreatedAtAscIdAsc(userId: UUID): List<RoleAssignmentJpaEntity>
    fun findByRoleId(roleId: UUID): List<RoleAssignmentJpaEntity>
    fun existsByUserId(userId: UUID): Boolean
}

@Repository
interface AuditLogJpaRepository : JpaRepository<AuditLogJpaEntity, UUID> {
    @Query(
        """
        select a from AuditLogJpaEntity a
        where (:entityType is null or a.entityType = :entityType)
          and (:entityId is null or a.entityId = :entityId)
          and (:actorUserId is null or a.actorUserId = :actorUserId)
        order by a.occurredAt desc
        """
    )
    fun search(
        @Param("entityType") entityType: String?,
        @Param("entityId") entityId: String?,
        @Param("actorUserId") actorUserId: UUID?,
        pageable: Pageable
    ): List<AuditLogJpaEntity>
}
