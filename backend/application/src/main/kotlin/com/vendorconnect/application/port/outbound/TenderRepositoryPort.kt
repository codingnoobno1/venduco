package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.tender.Tender
import java.util.UUID

/**
 * Port for tender persistence.
 * No adapter yet — add one before injecting this port anywhere.
 */
interface TenderRepositoryPort {
    fun save(tender: Tender): Tender
    fun findById(id: UUID): Tender?
    fun findByProjectId(projectId: UUID): List<Tender>
    fun findAll(): List<Tender>
    fun deleteById(id: UUID)
}
