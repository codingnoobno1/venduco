package com.vendorconnect.domain.organization

import com.vendorconnect.domain.shared.AuditInfo
import java.util.UUID

/**
 * Organization entity.
 * Represents stakeholders like DFCCIL, RVNL, L&T, Tata Projects, NHAI.
 */
data class Organization(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val code: String,
    val type: OrganizationType,
    val isActive: Boolean = true,
    val audit: AuditInfo = AuditInfo()
)

enum class OrganizationType {
    GOVERNMENT_AUTHORITY,  // DFCCIL, RVNL, NHAI
    EPC_CONTRACTOR,        // L&T, Tata Projects
    VENDOR,                // Sub-contractors, suppliers
    CONSULTANT             // PMC, design consultants
}
