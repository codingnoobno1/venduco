package com.vendorconnect.application.port.outbound

import java.time.Instant
import java.util.UUID

data class AuditEntry(
    val id: UUID = UUID.randomUUID(),
    val occurredAt: Instant = Instant.now(),
    val actorUserId: UUID?,
    val assignmentId: UUID?,
    val action: String,
    val entityType: String,
    val entityId: String,
    val summary: String
)

/** Append-only record of privileged changes. There is deliberately no update or delete. */
interface AuditLogPort {
    fun append(entry: AuditEntry)
    fun findRecent(entityType: String?, entityId: String?, actorUserId: UUID?, limit: Int): List<AuditEntry>
}
