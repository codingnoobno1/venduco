package com.vendorconnect.domain.shared

import java.time.Instant

/**
 * Audit information embedded in all domain entities.
 * Tracks creation and modification timestamps.
 */
data class AuditInfo(
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
    val createdBy: String? = null,
    val updatedBy: String? = null
)
