package com.vendorconnect.application.usecase.partner

import com.vendorconnect.application.port.outbound.BidRepositoryPort
import com.vendorconnect.application.port.outbound.FileStoragePort
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.ProjectRepositoryPort
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.domain.shared.ConflictException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.FieldErrorsException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.partner.QualificationStatus
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.domain.tender.Bid
import com.vendorconnect.domain.tender.BidQuotation
import com.vendorconnect.domain.tender.BidStatus
import com.vendorconnect.domain.tender.Tender
import com.vendorconnect.domain.tender.TenderLine
import com.vendorconnect.domain.tender.TenderStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.ByteArrayInputStream
import java.time.Instant
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Tenders as a bidder sees them, and the bidder's own bid on each.
 *
 * A bidder sees published tenders, plus any tender they already have a bid on. Whose bid is read
 * or changed always follows from who is signed in. A bid can be drafted by anyone who can see the
 * tender, but only submitted once their qualification has been approved.
 */
@Service
class PartnerTenderUseCase(
    private val tenders: TenderRepositoryPort,
    private val bids: BidRepositoryPort,
    private val projects: ProjectRepositoryPort,
    private val qualification: QualificationUseCase,
    private val storage: FileStoragePort,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserRepositoryPort,
    private val audit: AuditRecorder
) {

    enum class CheckState { PASSED, PENDING, FAILED }

    data class EligibilityCheck(val label: String, val state: CheckState, val detail: String)

    data class TenderView(
        val tender: Tender,
        val projectName: String?,
        val open: Boolean,
        val daysLeft: Long?,
        val lines: List<TenderLine>,
        val checks: List<EligibilityCheck>,
        val bid: Bid?,
        /** True if this bidder's bid won, false if another did, null while undecided or without a submitted bid. */
        val won: Boolean?,
        /** What still stops the bid from being submitted, in the bidder's words; empty when it can go. */
        val blockers: List<String>
    ) {
        val eligible: Boolean get() = checks.all { it.state == CheckState.PASSED }
        val canEdit: Boolean get() = open && bid?.status != BidStatus.SUBMITTED
        val canSubmit: Boolean get() = canEdit && blockers.isEmpty()
        val canWithdraw: Boolean get() = open && bid?.status == BidStatus.SUBMITTED
    }

    data class SaveBidCommand(val amount: Money?, val validityDays: Int?, val note: String?)

    data class SubmittedBid(val bid: Bid, val bidder: String)

    // ── Bidder side ──

    @Transactional(readOnly = true)
    fun visibleTenders(ctx: AccessContext): List<TenderView> {
        val bidder = bidderOf(ctx)
        val mine = bids.findByBidder(bidder).associateBy { it.tenderId }
        val status = qualification.statusOf(bidder)
        return tenders.findAll()
            .filter { it.status == TenderStatus.PUBLISHED || it.id in mine }
            .sortedWith(compareByDescending<Tender> { isOpen(it) }.thenBy { it.closingDate ?: LocalDate.MAX })
            .map { view(it, mine[it.id], status, withLines = false) }
    }

    @Transactional(readOnly = true)
    fun detail(ctx: AccessContext, tenderId: UUID): TenderView {
        val bidder = bidderOf(ctx)
        return view(visibleTender(tenderId, bidder), bids.find(tenderId, bidder), qualification.statusOf(bidder), withLines = true)
    }

    @Transactional
    fun saveBid(ctx: AccessContext, tenderId: UUID, command: SaveBidCommand): TenderView {
        val current = editableBid(ctx, tenderId)
        val errors = buildMap {
            command.validityDays?.let { if (it !in 1..MAX_VALIDITY_DAYS) put("validityDays", "Validity is between 1 and $MAX_VALIDITY_DAYS days.") }
            if ((command.note?.length ?: 0) > MAX_NOTE) put("note", "Keep the note under $MAX_NOTE characters.")
        }
        if (errors.isNotEmpty()) throw FieldErrorsException(errors)

        bids.save(current.copy(amount = command.amount, validityDays = command.validityDays,
            note = command.note?.trim()?.ifEmpty { null }, updatedAt = Instant.now()))
        return detail(ctx, tenderId)
    }

    @Transactional
    fun uploadQuotation(ctx: AccessContext, tenderId: UUID, fileName: String, bytes: ByteArray): TenderView {
        val current = editableBid(ctx, tenderId)
        requireDomain(bytes.isNotEmpty()) { "The file is empty." }
        requireDomain(bytes.size <= UploadRules.MAX_BYTES) { "The file is larger than ${UploadRules.MAX_BYTES / (1024 * 1024)} MB." }
        val contentType = UploadRules.sniff(bytes) ?: throw FieldErrorsException(mapOf("quotation" to UploadRules.REFUSAL))

        val path = storage.store(fileName, ByteArrayInputStream(bytes), contentType)
        bids.save(current.copy(
            quotation = BidQuotation(UploadRules.displayName(fileName), contentType, bytes.size.toLong(), path),
            updatedAt = Instant.now()
        ))
        current.quotation?.let { storage.delete(it.storagePath) }
        return detail(ctx, tenderId)
    }

    @Transactional
    fun removeQuotation(ctx: AccessContext, tenderId: UUID): TenderView {
        val current = editableBid(ctx, tenderId)
        current.quotation?.let {
            bids.save(current.copy(quotation = null, updatedAt = Instant.now()))
            storage.delete(it.storagePath)
        }
        return detail(ctx, tenderId)
    }

    @Transactional(readOnly = true)
    fun myQuotation(ctx: AccessContext, tenderId: UUID): QualificationUseCase.DocumentContent {
        val quotation = bids.find(tenderId, bidderOf(ctx))?.quotation ?: throw EntityNotFoundException("Quotation", tenderId)
        val bytes = storage.retrieve(quotation.storagePath) ?: throw EntityNotFoundException("Quotation", tenderId)
        return QualificationUseCase.DocumentContent(quotation.fileName, quotation.contentType, bytes)
    }

    @Transactional
    fun submit(ctx: AccessContext, tenderId: UUID): TenderView {
        val before = detail(ctx, tenderId)
        if (!before.canEdit) throw ConflictException(if (before.open) "This bid has already been submitted." else "This tender is closed.")
        requireDomain(before.blockers.isEmpty()) { before.blockers.first() }

        val saved = bids.save(before.bid!!.copy(status = BidStatus.SUBMITTED, submittedBy = ctx.userId,
            submittedAt = Instant.now(), updatedAt = Instant.now()))
        // The amount is deliberately left out: the audit log is read by people who must not see sealed bids.
        audit.record(ctx, "BID_SUBMITTED", ENTITY, saved.id, "${bidderName(saved.bidder)} submitted a bid on ${before.tender.referenceNumber}")
        return detail(ctx, tenderId)
    }

    /** Takes a submitted bid back to draft so it can be changed. Only while the tender is open. */
    @Transactional
    fun withdraw(ctx: AccessContext, tenderId: UUID): TenderView {
        val before = detail(ctx, tenderId)
        if (!before.canWithdraw) throw ConflictException(if (before.open) "There is no submitted bid to withdraw." else "This tender is closed; the bid can no longer be withdrawn.")

        val saved = bids.save(before.bid!!.copy(status = BidStatus.DRAFT, submittedBy = null, submittedAt = null, updatedAt = Instant.now()))
        audit.record(ctx, "BID_WITHDRAWN", ENTITY, saved.id, "${bidderName(saved.bidder)} withdrew their bid on ${before.tender.referenceNumber}")
        return detail(ctx, tenderId)
    }

    // ── Buyer side (callers hold `bid:evaluate`) ──

    /** Submitted bids on a tender. Sealed until the day after its closing date, so nobody can tip off a late bidder. */
    @Transactional(readOnly = true)
    fun sealedBids(tenderId: UUID): List<SubmittedBid> {
        val tender = tenders.findById(tenderId) ?: throw EntityNotFoundException("Tender", tenderId)
        if (isOpen(tender)) throw ConflictException("Bids are sealed until the tender closes on ${tender.closingDate ?: "its closing date"}.")
        return bids.findByTender(tenderId).filter { it.status == BidStatus.SUBMITTED }.map { SubmittedBid(it, bidderName(it.bidder)) }
    }

    // ── Internals ──

    private fun bidderOf(ctx: AccessContext): SubjectRef =
        ctx.organizationId?.let { SubjectRef(SubjectType.ORGANIZATION, it) } ?: SubjectRef(SubjectType.USER, ctx.userId)

    private fun bidderName(bidder: SubjectRef): String = when (bidder.type) {
        SubjectType.ORGANIZATION -> organizations.findById(bidder.id)?.name
        SubjectType.USER -> users.findById(bidder.id)?.let { "${it.fullName} <${it.email}>" }
    } ?: "(removed)"

    /** A tender the bidder may know about; anything else is reported as not existing. */
    private fun visibleTender(tenderId: UUID, bidder: SubjectRef): Tender {
        val tender = tenders.findById(tenderId) ?: throw EntityNotFoundException("Tender", tenderId)
        if (tender.status != TenderStatus.PUBLISHED && bids.find(tenderId, bidder) == null) throw EntityNotFoundException("Tender", tenderId)
        return tender
    }

    private fun editableBid(ctx: AccessContext, tenderId: UUID): Bid {
        val bidder = bidderOf(ctx)
        val tender = visibleTender(tenderId, bidder)
        if (!isOpen(tender)) throw ConflictException("This tender is closed.")
        val current = bids.find(tenderId, bidder) ?: Bid(tenderId = tenderId, bidder = bidder)
        if (current.status == BidStatus.SUBMITTED) throw ConflictException("The bid has been submitted. Withdraw it first to make changes.")
        return current
    }

    /** Open through the end of its closing date. */
    private fun isOpen(tender: Tender): Boolean =
        tender.status == TenderStatus.PUBLISHED && (tender.closingDate == null || !LocalDate.now().isAfter(tender.closingDate))

    private fun view(tender: Tender, bid: Bid?, qualificationStatus: QualificationStatus?, withLines: Boolean): TenderView {
        val open = isOpen(tender)
        val checks = listOf(
            EligibilityCheck("Account approved", CheckState.PASSED, "Your account is approved to use the platform."),
            when (qualificationStatus) {
                QualificationStatus.APPROVED -> EligibilityCheck(QUALIFICATION, CheckState.PASSED, "Your qualification has been approved.")
                QualificationStatus.SUBMITTED -> EligibilityCheck(QUALIFICATION, CheckState.PENDING, "Your qualification is under review.")
                QualificationStatus.REJECTED -> EligibilityCheck(QUALIFICATION, CheckState.FAILED, "Your qualification was not approved.")
                QualificationStatus.CORRECTION_REQUIRED -> EligibilityCheck(QUALIFICATION, CheckState.FAILED, "Your qualification needs a correction before it can be approved.")
                QualificationStatus.DRAFT, null -> EligibilityCheck(QUALIFICATION, CheckState.FAILED, "Complete and submit your qualification application.")
            },
            if (open) EligibilityCheck("Tender open", CheckState.PASSED, tender.closingDate?.let { "Bids are accepted until the end of $it." } ?: "Bids are being accepted.")
            else EligibilityCheck("Tender open", CheckState.FAILED, "This tender is no longer accepting bids.")
        )
        val blockers = buildList {
            checks.filter { it.state != CheckState.PASSED }.forEach { add(it.detail) }
            if (bid?.amount == null || bid.amount!!.amount.signum() <= 0) add("Enter your bid value.")
            if (bid?.quotation == null) add("Upload your quotation document.")
        }
        return TenderView(
            tender = tender,
            projectName = projects.findById(tender.projectId)?.name,
            open = open,
            daysLeft = tender.closingDate?.takeIf { open }?.let { ChronoUnit.DAYS.between(LocalDate.now(), it) },
            lines = if (withLines) bids.findTenderLines(tender.id) else emptyList(),
            checks = checks,
            bid = bid,
            won = bid?.takeIf { it.status == BidStatus.SUBMITTED }?.let { mine -> bids.findAward(tender.id)?.let { it.bidId == mine.id } },
            blockers = blockers
        )
    }

    private companion object {
        const val ENTITY = "BID"
        const val QUALIFICATION = "Qualification approved"
        const val MAX_VALIDITY_DAYS = 365
        const val MAX_NOTE = 1000
    }
}
