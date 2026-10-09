package com.vendorconnect.domain.tender

import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.shared.Money
import java.time.Instant
import java.util.UUID

enum class BidStatus { DRAFT, SUBMITTED }

data class BidQuotation(
    val fileName: String,
    val contentType: String,
    val sizeBytes: Long,
    val storagePath: String,
    val uploadedAt: Instant = Instant.now()
)

/**
 * A bidder's offer on one tender. A draft can be changed freely; a submitted bid is fixed unless
 * the bidder withdraws it (back to draft) while the tender is still open.
 */
data class Bid(
    val id: UUID = UUID.randomUUID(),
    val tenderId: UUID,
    val bidder: SubjectRef,
    val status: BidStatus = BidStatus.DRAFT,
    val amount: Money? = null,
    /** How long the offer stands after the tender closes. */
    val validityDays: Int? = null,
    val note: String? = null,
    val quotation: BidQuotation? = null,
    val submittedBy: UUID? = null,
    val submittedAt: Instant? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

/** A line of the tender's bill of quantities as bidders see it: what and how much, without the buyer's estimated rate. */
data class TenderLine(val description: String, val quantity: Long, val unit: String)
