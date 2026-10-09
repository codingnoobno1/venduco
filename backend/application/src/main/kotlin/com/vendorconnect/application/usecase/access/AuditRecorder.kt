package com.vendorconnect.application.usecase.access

import com.vendorconnect.application.port.outbound.AuditEntry
import com.vendorconnect.application.port.outbound.AuditLogPort
import com.vendorconnect.domain.access.AccessContext
import org.springframework.stereotype.Component
import java.util.UUID

/** Writes audit entries inside the caller's transaction, so a change and its record commit together. */
@Component
class AuditRecorder(private val auditLog: AuditLogPort) {

    fun record(ctx: AccessContext?, action: String, entityType: String, entityId: Any, summary: String) {
        record(ctx?.userId, ctx?.assignmentId, action, entityType, entityId, summary)
    }

    fun record(actorUserId: UUID?, assignmentId: UUID?, action: String, entityType: String, entityId: Any, summary: String) {
        auditLog.append(
            AuditEntry(
                actorUserId = actorUserId,
                assignmentId = assignmentId,
                action = action,
                entityType = entityType,
                entityId = entityId.toString(),
                summary = summary
            )
        )
    }
}
