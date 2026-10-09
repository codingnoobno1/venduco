package com.vendorconnect.persistence.jpa.repository

import com.vendorconnect.persistence.jpa.entity.TenderJpaEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TenderJpaRepository : JpaRepository<TenderJpaEntity, String> {
    fun findByStatus(status: String): List<TenderJpaEntity>
    fun findByProjectId(projectId: String): List<TenderJpaEntity>
    fun findByReferenceNumber(referenceNumber: String): TenderJpaEntity?
}
