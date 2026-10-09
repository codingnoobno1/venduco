package com.vendorconnect.domain.partner

import com.vendorconnect.domain.account.SubjectRef
import java.time.Instant
import java.util.UUID

enum class QualificationStatus(val editable: Boolean) {
    DRAFT(true),
    SUBMITTED(false),
    CORRECTION_REQUIRED(true),
    APPROVED(false),
    REJECTED(false)
}

/**
 * One company's (or individual's) answers to the [QualificationTemplate].
 *
 * @property answers field key to a String, or a List of Strings for multi-select fields.
 *   Sensitive answers are held in protected form, never as entered.
 * @property version starts at 1 and goes up each time the application is resubmitted after a correction.
 */
data class QualificationApplication(
    val id: UUID = UUID.randomUUID(),
    val subject: SubjectRef,
    val status: QualificationStatus = QualificationStatus.DRAFT,
    val version: Int = 1,
    val templateVersion: Int = QualificationTemplate.VERSION,
    val answers: Map<String, Any?> = emptyMap(),
    val submittedBy: UUID? = null,
    val submittedAt: Instant? = null,
    val reviewNote: String? = null,
    val decidedBy: UUID? = null,
    val decidedAt: Instant? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

data class QualificationDocument(
    val id: UUID = UUID.randomUUID(),
    val applicationId: UUID,
    val fieldKey: String,
    val fileName: String,
    val contentType: String,
    val sizeBytes: Long,
    val storagePath: String,
    val uploadedBy: UUID?,
    val uploadedAt: Instant = Instant.now()
)
