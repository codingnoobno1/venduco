package com.vendorconnect.domain.tender

import com.vendorconnect.domain.shared.InvalidStateTransitionException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.shared.AuditInfo
import com.vendorconnect.domain.shared.Money
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * Tender aggregate root.
 * Represents a tender document in the infrastructure corridor system.
 * A tender belongs to a corridor [com.vendorconnect.domain.project.Project].
 */
data class Tender(
    val id: UUID = UUID.randomUUID(),
    val title: String,
    val description: String,
    val referenceNumber: String,
    val projectId: UUID,
    val packageId: UUID? = null,
    val estimatedValue: Money,
    val status: TenderStatus = TenderStatus.DRAFT,
    val publishDate: LocalDate? = null,
    val closingDate: LocalDate? = null,
    val items: List<TenderItem> = emptyList(),
    val aiAnalysis: TenderAiAnalysis? = null,
    val audit: AuditInfo = AuditInfo()
) {
    fun publish(): Tender {
        requireStatus(TenderStatus.DRAFT, TenderStatus.PUBLISHED)
        requireDomain(items.isNotEmpty()) { "Tender must have at least one item" }
        return copy(status = TenderStatus.PUBLISHED, publishDate = LocalDate.now())
    }

    fun close(): Tender {
        requireStatus(TenderStatus.PUBLISHED, TenderStatus.CLOSED)
        return copy(status = TenderStatus.CLOSED, closingDate = LocalDate.now())
    }

    fun attachAiAnalysis(analysis: TenderAiAnalysis): Tender {
        return copy(aiAnalysis = analysis)
    }

    private fun requireStatus(expected: TenderStatus, target: TenderStatus) {
        if (status != expected) throw InvalidStateTransitionException("Tender", status.name, target.name)
    }
}

enum class TenderStatus {
    DRAFT, PUBLISHED, UNDER_REVIEW, CLOSED, AWARDED, CANCELLED
}

data class TenderItem(
    val id: UUID = UUID.randomUUID(),
    val description: String,
    val quantity: Int,
    val unit: String,
    val estimatedRate: Money
) {
    init {
        requireDomain(quantity > 0) { "Tender item quantity must be positive" }
    }
}

/**
 * Result from the AI microservice analysis.
 */
data class TenderAiAnalysis(
    val riskScore: Double,
    val extractedEntities: List<String>,
    val recommendations: List<String>,
    val analyzedAt: Instant = Instant.now()
)
