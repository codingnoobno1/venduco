package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.partner.PartnerTenderUseCase
import com.vendorconnect.application.usecase.tender.TenderUseCase
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.tender.TenderStatus
import com.vendorconnect.security.RequirePermission
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDate
import java.util.Currency
import java.util.UUID

@RestController
@RequestMapping("/api/v1/tenders")
class TenderController(
    private val tenderUseCase: TenderUseCase,
    private val partnerTenders: PartnerTenderUseCase
) {

    data class CreateTenderRequest(
        val title: String,
        val description: String,
        val projectId: String,
        val packageId: String? = null,
        val estimatedValueAmount: Double,
        val estimatedValueCurrency: String = "INR",
        val closingDate: String
    )

    data class TenderResponse(
        val id: String,
        val title: String,
        val description: String,
        val referenceNumber: String,
        val projectId: String,
        val status: String,
        val estimatedValue: String,
        val aiRiskScore: Double?,
        val publishDate: String?,
        val closingDate: String?
    )

    @PostMapping
    @RequirePermission(Permissions.TENDER_MANAGE)
    fun create(@RequestBody request: CreateTenderRequest): ResponseEntity<TenderResponse> {
        val tender = tenderUseCase.create(
            TenderUseCase.CreateTenderCommand(
                title = request.title,
                description = request.description,
                projectId = UUID.fromString(request.projectId),
                packageId = request.packageId?.let { UUID.fromString(it) },
                estimatedValue = Money(
                    BigDecimal.valueOf(request.estimatedValueAmount), 
                    Currency.getInstance(request.estimatedValueCurrency)
                ),
                closingDate = LocalDate.parse(request.closingDate)
            )
        )
        return ResponseEntity.ok(tender.toResponse())
    }

    @GetMapping
    @RequirePermission(Permissions.TENDER_READ)
    fun list(
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) projectId: String?
    ): ResponseEntity<List<TenderResponse>> {
        val tenders = tenderUseCase.list(
            TenderUseCase.TenderListQuery(
                status = status?.let { TenderStatus.valueOf(it) },
                projectId = projectId?.let { UUID.fromString(it) }
            )
        )
        return ResponseEntity.ok(tenders.map { it.toResponse() })
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.TENDER_READ)
    fun getById(@PathVariable id: UUID): ResponseEntity<TenderResponse> {
        return ResponseEntity.ok(tenderUseCase.getById(id).toResponse())
    }

    @PostMapping("/{id}/publish")
    @RequirePermission(Permissions.TENDER_MANAGE)
    fun publish(@PathVariable id: UUID): ResponseEntity<TenderResponse> {
        return ResponseEntity.ok(tenderUseCase.publish(id).toResponse())
    }

    @PostMapping("/{id}/analyze")
    @RequirePermission(Permissions.TENDER_MANAGE)
    fun analyze(@PathVariable id: UUID): ResponseEntity<TenderResponse> {
        return ResponseEntity.ok(tenderUseCase.analyzeWithAi(id).toResponse())
    }

    data class BidResponse(val bidder: String, val amount: MoneyDto, val validityDays: Int?, val note: String?,
                           val hasQuotation: Boolean, val submittedAt: String)

    /** Submitted bids. Refused with 409 until the tender's closing date has passed: bids are sealed until then. */
    @GetMapping("/{id}/bids")
    @RequirePermission(Permissions.BID_EVALUATE)
    fun bids(@PathVariable id: UUID): List<BidResponse> = partnerTenders.sealedBids(id).map {
        BidResponse(it.bidder, it.bid.amount!!.toDto(), it.bid.validityDays, it.bid.note, it.bid.quotation != null,
            it.bid.submittedAt.toString())
    }

    private fun com.vendorconnect.domain.tender.Tender.toResponse() = TenderResponse(
        id = id.toString(),
        title = title,
        description = description,
        referenceNumber = referenceNumber,
        projectId = projectId.toString(),
        status = status.name,
        estimatedValue = "${estimatedValue.currency} ${estimatedValue.amount}",
        aiRiskScore = aiAnalysis?.riskScore,
        publishDate = publishDate?.toString(),
        closingDate = closingDate?.toString()
    )
}
