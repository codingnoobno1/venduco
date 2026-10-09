package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.tender.Bid
import com.vendorconnect.domain.tender.TenderLine
import java.time.Instant
import java.util.UUID

data class TenderAward(val tenderId: UUID, val bidId: UUID, val reason: String, val awardedBy: UUID, val awardedAt: Instant)

interface BidRepositoryPort {
    fun save(bid: Bid): Bid
    fun find(tenderId: UUID, bidder: SubjectRef): Bid?
    fun findByBidder(bidder: SubjectRef): List<Bid>
    fun findByTender(tenderId: UUID): List<Bid>

    fun saveAward(award: TenderAward)
    fun findAward(tenderId: UUID): TenderAward?

    /** Sets only the tender's status, leaving the rest of the row exactly as it is. */
    fun markTenderAwarded(tenderId: UUID)

    /** Records the winning company as the contractor of the work package the tender was for. */
    fun assignPackageContractor(packageId: UUID, organizationId: UUID)

    /** The tender's bill of quantities, in the order it was entered. */
    fun findTenderLines(tenderId: UUID): List<TenderLine>
}
