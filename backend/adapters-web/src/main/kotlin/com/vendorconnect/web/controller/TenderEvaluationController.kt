package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.tender.BidEvaluationUseCase
import com.vendorconnect.application.usecase.tender.BidEvaluationUseCase.Evaluation
import com.vendorconnect.web.controller.PartnerQualificationController.Companion.toResponse
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.security.RequirePermission
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.util.UUID

/** Bid comparison and award, for the buyer. */
@RestController
@RequestMapping("/api/v1/tender-evaluations")
class TenderEvaluationController(private val evaluations: BidEvaluationUseCase) {

    data class RankedBidDto(
        val bidId: String,
        val rank: Int,
        val bidder: String,
        val bidderKind: String,
        val amount: MoneyDto,
        val versusEstimatePct: BigDecimal?,
        val versusLowestPct: BigDecimal,
        val validityDays: Int?,
        val offerValidUntil: String?,
        val note: String?,
        val quotationFileName: String?,
        val submittedAt: String?,
        val qualification: String?,
        val awarded: Boolean
    )

    data class AwardDto(val bidId: String, val bidder: String?, val reason: String, val awardedBy: String, val awardedAt: String)

    data class EvaluationDto(
        val tenderId: String,
        val title: String,
        val referenceNumber: String,
        val project: String?,
        val status: String,
        val stage: String,
        val closingDate: String?,
        val estimatedValue: MoneyDto,
        val sealed: Boolean,
        /** Absent while sealed: not even the number of bids is disclosed before closing. */
        val bidCount: Int?,
        val bids: List<RankedBidDto>?,
        val award: AwardDto?,
        val canAward: Boolean,
        val awardBlockedReason: String?
    )

    data class AwardRequest(@field:NotNull val bidId: UUID?, @field:NotBlank val reason: String = "")

    @GetMapping
    @RequirePermission(Permissions.BID_EVALUATE)
    fun list(ctx: AccessContext): List<EvaluationDto> = evaluations.tenders(ctx).map { it.toDto(withBids = false) }

    @GetMapping("/{tenderId}")
    @RequirePermission(Permissions.BID_EVALUATE)
    fun detail(@PathVariable tenderId: UUID, ctx: AccessContext): EvaluationDto = evaluations.evaluation(ctx, tenderId).toDto(withBids = true)

    @GetMapping("/{tenderId}/bids/{bidId}/quotation")
    @RequirePermission(Permissions.BID_EVALUATE)
    fun quotation(@PathVariable tenderId: UUID, @PathVariable bidId: UUID): ResponseEntity<ByteArray> =
        evaluations.quotation(tenderId, bidId).toResponse()

    @PostMapping("/{tenderId}/award")
    @RequirePermission(Permissions.HIRING_AWARD)
    fun award(@PathVariable tenderId: UUID, @Valid @RequestBody request: AwardRequest, ctx: AccessContext): EvaluationDto =
        evaluations.award(ctx, tenderId, request.bidId!!, request.reason).toDto(withBids = true)

    private fun Evaluation.toDto(withBids: Boolean) = EvaluationDto(
        tenderId = tender.id.toString(),
        title = tender.title,
        referenceNumber = tender.referenceNumber,
        project = projectName,
        status = tender.status.name,
        stage = stage.name,
        closingDate = tender.closingDate?.toString(),
        estimatedValue = tender.estimatedValue.toDto(),
        sealed = sealed,
        bidCount = bids?.size,
        bids = bids?.takeIf { withBids }?.map {
            RankedBidDto(
                bidId = it.bid.id.toString(),
                rank = it.rank,
                bidder = it.bidder,
                bidderKind = if (it.isCompany) "COMPANY" else "INDIVIDUAL",
                amount = it.bid.amount!!.toDto(),
                versusEstimatePct = it.versusEstimatePct,
                versusLowestPct = it.versusLowestPct,
                validityDays = it.bid.validityDays,
                offerValidUntil = it.offerValidUntil?.toString(),
                note = it.bid.note,
                quotationFileName = it.bid.quotation?.fileName,
                submittedAt = it.bid.submittedAt?.toString(),
                qualification = it.qualification?.name,
                awarded = it.awarded
            )
        },
        award = award?.let { AwardDto(it.award.bidId.toString(), it.bidder, it.award.reason, it.awardedBy, it.award.awardedAt.toString()) },
        canAward = canAward,
        awardBlockedReason = awardBlockedReason
    )
}
