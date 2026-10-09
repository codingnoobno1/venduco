package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.account.ApprovalStatus
import java.time.Instant
import java.util.UUID

data class OrganizationRef(
    val id: UUID,
    val name: String,
    val code: String,
    val type: String,
    val approvalStatus: ApprovalStatus = ApprovalStatus.APPROVED,
    val approvalNote: String? = null,
    val createdAt: Instant? = null
)

/** Organisations (companies): lookup, creation at registration, and their approval status. */
interface OrganizationDirectoryPort {
    fun findAll(): List<OrganizationRef>
    fun findById(id: UUID): OrganizationRef?
    fun create(name: String, type: String, approvalStatus: ApprovalStatus): OrganizationRef
    fun updateApproval(id: UUID, status: ApprovalStatus, note: String?)
}
