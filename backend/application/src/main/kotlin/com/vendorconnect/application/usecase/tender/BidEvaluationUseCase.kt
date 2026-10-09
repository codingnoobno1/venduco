package com.vendorconnect.application.usecase.tender

import com.vendorconnect.application.port.outbound.BidRepositoryPort
import com.vendorconnect.application.port.outbound.CachePort
import com.vendorconnect.application.port.outbound.FileStoragePort
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.ProjectRepositoryPort
import com.vendorconnect.application.port.outbound.TenderAward
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.application.usecase.partner.QualificationUseCase
import com.vendorconnect.domain.shared.ConflictException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.partner.QualificationStatus
import com.vendorconnect.domain.tender.Bid
import com.vendorconnect.domain.tender.BidStatus
import com.vendorconnect.domain.tender.Tender
import com.vendorconnect.domain.tender.TenderStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * The buyer's side of bidding: compare the bids on a tender once it has closed, and award it.
 *
 * Until a tender's closing date has passed its bids are sealed: neither their content nor how many
 * there are is disclosed, so nobody on the buyer's side can tip off a late bidder.
 * Viewing needs `bid:evaluate`; awarding needs `hiring:award` (both checked at the delivery layer).
 */
@Service
class BidEvaluationUseCase(
    private val tenders: TenderRepositoryPort,
    private val bids: BidRepositoryPort,
    private val projects: ProjectRepositoryPort,
    private val qualification: QualificationUseCase,
    private val storage: FileStoragePort,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserRepositoryPort,
    private val cache: CachePort,
    private val audit: AuditRecorder
) {

    enum class Stage { OPEN, EVALUATION, AWARDED, CLOSED }

    data class RankedBid(
        val bid: Bid,
        val bidder: String,
        val isCompany: Boolean,
        /** 1 is the lowest price. Equal amounts share a rank. */
        val rank: Int,
        /** Percent above (+) or below (−) the buyer's estimate. */
        val versusEstimatePct: BigDecimal?,
        /** Percent above the lowest bid; zero for the lowest. */
        val versusLowestPct: BigDecimal,
        val offerValidUntil: LocalDate?,
        val qualification: QualificationStatus?,
        val awarded: Boolean
    )

    data class AwardView(val award: TenderAward, val bidder: String?, val awardedBy: String)

    data class Evaluation(
        val tender: Tender,
        val projectName: String?,
        val stage: Stage,
        /** Null while the tender is sealed. */
        val bids: List<RankedBid>?,
        val award: AwardView?,
        val canAward: Boolean,
        val awardBlockedReason: String?
    ) {
        val sealed: Boolean get() = bids == null
    }

    @Transactional(readOnly = true)
    fun tenders(ctx: AccessContext): List<Evaluation> = tenders.findAll()
        .filter { it.status != TenderStatus.DRAFT && it.status != TenderStatus.CANCELLED }
        .map { evaluate(ctx, it) }
        .sortedWith(compareBy<Evaluation> { STAGE_ORDER.indexOf(it.stage) }.thenBy { it.tender.closingDate ?: LocalDate.MAX })

    @Transactional(readOnly = true)
    fun evaluation(ctx: AccessContext, tenderId: UUID): Evaluation = evaluate(ctx, findTender(tenderId))

    @Transactional(readOnly = true)
    fun quotation(tenderId: UUID, bidId: UUID): QualificationUseCase.DocumentContent {
        val tender = findTender(tenderId)
        if (isSealed(tender)) throw ConflictException(SEALED)
        val quotation = submittedBids(tenderId).firstOrNull { it.id == bidId }?.quotation ?: throw EntityNotFoundException("Quotation", bidId)
        val bytes = storage.retrieve(quotation.storagePath) ?: throw EntityNotFoundException("Quotation", bidId)
        return QualificationUseCase.DocumentContent(quotation.fileName, quotation.contentType, bytes)
    }

    /**
     * Awards the tender to one bid. The reason is always recorded; it matters most when the chosen
     * bid is not the lowest, which is allowed but has to be justified.
     */
    @Transactional
    fun award(ctx: AccessContext, tenderId: UUID, bidId: UUID, reason: String): Evaluation {
        val tender = findTender(tenderId)
        if (isSealed(tender)) throw ConflictException(SEALED)
        if (tender.status == TenderStatus.AWARDED || bids.findAward(tenderId) != null) throw ConflictException("This tender has already been awarded.")
        if (tender.status == TenderStatus.CANCELLED) throw ConflictException("This tender was cancelled.")

        val candidates = submittedBids(tenderId)
        val chosen = candidates.firstOrNull { it.id == bidId } ?: throw EntityNotFoundException("Bid", bidId)
        val text = reason.trim()
        val isLowest = chosen.amount!!.amount.compareTo(candidates.minOf { it.amount!!.amount }) == 0
        requireDomain(text.length >= MIN_REASON) {
            if (isLowest) "Record the reason for this award (at least $MIN_REASON characters)."
            else "This is not the lowest bid. Record why it is being chosen (at least $MIN_REASON characters)."
        }
        requireDomain(text.length <= MAX_REASON) { "Keep the reason under $MAX_REASON characters." }
        // Nobody awards a tender to their own company, or to themselves.
        requireDomain(chosen.bidder.id != ctx.organizationId && chosen.bidder.id != ctx.userId) { "You cannot award a tender to your own organisation." }
        requireDomain(chosen.offerValidUntil(tender)?.isBefore(LocalDate.now()) != true) { "This bid's offer validity has expired." }

        bids.saveAward(TenderAward(tenderId, chosen.id, text, ctx.userId, Instant.now()))
        bids.markTenderAwarded(tenderId)
        cache.delete("tender:$tenderId")
        // The package the tender was for now has its contractor.
        if (chosen.bidder.type == SubjectType.ORGANIZATION) tender.packageId?.let { bids.assignPackageContractor(it, chosen.bidder.id) }

        audit.record(ctx, "TENDER_AWARDED", "TENDER", tenderId,
            "${tender.referenceNumber} awarded to ${bidderName(chosen.bidder)} at ${chosen.amount!!.formatted()}" +
                (if (isLowest) "" else ", not the lowest bid") + " ($text)")
        return evaluate(ctx, tender.copy(status = TenderStatus.AWARDED))
    }

    private fun evaluate(ctx: AccessContext, tender: Tender): Evaluation {
        val award = bids.findAward(tender.id)
        val sealed = isSealed(tender)
        val stage = when {
            sealed -> Stage.OPEN
            tender.status == TenderStatus.AWARDED || award != null -> Stage.AWARDED
            tender.status == TenderStatus.CLOSED -> Stage.CLOSED
            else -> Stage.EVALUATION
        }
        val ranked = if (sealed) null else rank(tender, submittedBids(tender.id), award)
        val blocked = when {
            !ctx.has(Permissions.HIRING_AWARD) -> "Your role can compare bids but not award."
            sealed -> "Bids are sealed until the tender closes."
            stage == Stage.AWARDED -> "This tender has been awarded."
            ranked.isNullOrEmpty() -> "No bids were submitted."
            else -> null
        }
        return Evaluation(
            tender = tender,
            projectName = projects.findById(tender.projectId)?.name,
            stage = stage,
            bids = ranked,
            award = award?.let {
                AwardView(it, ranked?.firstOrNull { r -> r.awarded }?.bidder, users.findById(it.awardedBy)?.fullName ?: it.awardedBy.toString())
            },
            canAward = blocked == null,
            awardBlockedReason = blocked
        )
    }

    private fun rank(tender: Tender, submitted: List<Bid>, award: TenderAward?): List<RankedBid> {
        val sorted = submitted.sortedBy { it.amount!!.amount }
        val lowest = sorted.firstOrNull()?.amount?.amount ?: return emptyList()
        val estimate = tender.estimatedValue.amount
        return sorted.map { bid ->
            val amount = bid.amount!!.amount
            RankedBid(
                bid = bid,
                bidder = bidderName(bid.bidder),
                isCompany = bid.bidder.type == SubjectType.ORGANIZATION,
                rank = sorted.indexOfFirst { it.amount!!.amount.compareTo(amount) == 0 } + 1,
                versusEstimatePct = percentDifference(amount, estimate),
                versusLowestPct = percentDifference(amount, lowest) ?: BigDecimal.ZERO,
                offerValidUntil = bid.offerValidUntil(tender),
                qualification = qualification.statusOf(bid.bidder),
                awarded = award?.bidId == bid.id
            )
        }
    }

    private fun Bid.offerValidUntil(tender: Tender): LocalDate? =
        validityDays?.let { days -> tender.closingDate?.plusDays(days.toLong()) }

    private fun percentDifference(value: BigDecimal, base: BigDecimal): BigDecimal? =
        if (base.signum() == 0) null
        else value.subtract(base).multiply(BigDecimal(100)).divide(base, 1, RoundingMode.HALF_UP)

    private fun submittedBids(tenderId: UUID): List<Bid> =
        bids.findByTender(tenderId).filter { it.status == BidStatus.SUBMITTED && it.amount != null }

    /** Sealed through the end of the closing date, while the tender is still published. */
    private fun isSealed(tender: Tender): Boolean =
        tender.status == TenderStatus.PUBLISHED && (tender.closingDate == null || !LocalDate.now().isAfter(tender.closingDate))

    private fun findTender(id: UUID): Tender = tenders.findById(id) ?: throw EntityNotFoundException("Tender", id)

    private fun bidderName(bidder: SubjectRef): String = when (bidder.type) {
        SubjectType.ORGANIZATION -> organizations.findById(bidder.id)?.name
        SubjectType.USER -> users.findById(bidder.id)?.fullName
    } ?: "(removed)"

    private companion object {
        const val SEALED = "Bids are sealed until the tender closes."
        const val MIN_REASON = 10
        const val MAX_REASON = 1000
        val STAGE_ORDER = listOf(Stage.EVALUATION, Stage.OPEN, Stage.AWARDED, Stage.CLOSED)
    }
}
