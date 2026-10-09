package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.partner.PartnerTenderUseCase
import com.vendorconnect.application.usecase.partner.PartnerTenderUseCase.TenderView
import com.vendorconnect.application.usecase.partner.UploadRules
import com.vendorconnect.web.controller.PartnerQualificationController.Companion.toResponse
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.security.RequirePermission
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

/** Tenders open to the signed-in partner, and that partner's own bid on each. */
@RestController
@RequestMapping("/api/v1/partner/tenders")
class PartnerTenderController(private val tenders: PartnerTenderUseCase) {

    data class CheckDto(val label: String, val state: String, val detail: String)

    data class LineDto(val description: String, val quantity: Long, val unit: String)

    data class QuotationDto(val fileName: String, val sizeBytes: Long, val uploadedAt: String)

    data class BidDto(val status: String, val amount: MoneyDto?, val validityDays: Int?, val note: String?,
                      val quotation: QuotationDto?, val submittedAt: String?, val lastSavedAt: String)

    data class TenderDto(
        val id: String,
        val title: String,
        val referenceNumber: String,
        val description: String,
        val project: String?,
        val estimatedValue: MoneyDto,
        val publishDate: String?,
        val closingDate: String?,
        val open: Boolean,
        val daysLeft: Long?,
        val eligible: Boolean,
        val checks: List<CheckDto>,
        val lines: List<LineDto>,
        val bid: BidDto?,
        /** AWARDED_TO_YOU or NOT_SELECTED once the tender has been awarded and you had a submitted bid. */
        val outcome: String?,
        val canEdit: Boolean,
        val canSubmit: Boolean,
        val canWithdraw: Boolean,
        val blockers: List<String>,
        val maxDocumentBytes: Int
    )

    data class SaveBidRequest(@field:Valid val amount: MoneyDto? = null, val validityDays: Int? = null, val note: String? = null)

    @GetMapping
    @RequirePermission(Permissions.BID_SUBMIT)
    fun list(ctx: AccessContext): List<TenderDto> = tenders.visibleTenders(ctx).map { it.toDto() }

    @GetMapping("/{tenderId}")
    @RequirePermission(Permissions.BID_SUBMIT)
    fun detail(@PathVariable tenderId: UUID, ctx: AccessContext): TenderDto = tenders.detail(ctx, tenderId).toDto()

    @PutMapping("/{tenderId}/bid")
    @RequirePermission(Permissions.BID_SUBMIT)
    fun saveBid(@PathVariable tenderId: UUID, @Valid @RequestBody request: SaveBidRequest, ctx: AccessContext): TenderDto =
        tenders.saveBid(ctx, tenderId, PartnerTenderUseCase.SaveBidCommand(request.amount?.toDomain(), request.validityDays, request.note)).toDto()

    @PostMapping("/{tenderId}/bid/quotation", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @RequirePermission(Permissions.BID_SUBMIT)
    fun uploadQuotation(@PathVariable tenderId: UUID, @RequestParam file: MultipartFile, ctx: AccessContext): TenderDto =
        tenders.uploadQuotation(ctx, tenderId, file.originalFilename.orEmpty(), file.bytes).toDto()

    @DeleteMapping("/{tenderId}/bid/quotation")
    @RequirePermission(Permissions.BID_SUBMIT)
    fun removeQuotation(@PathVariable tenderId: UUID, ctx: AccessContext): TenderDto = tenders.removeQuotation(ctx, tenderId).toDto()

    @GetMapping("/{tenderId}/bid/quotation")
    @RequirePermission(Permissions.BID_SUBMIT)
    fun quotation(@PathVariable tenderId: UUID, ctx: AccessContext): ResponseEntity<ByteArray> =
        tenders.myQuotation(ctx, tenderId).toResponse()

    @PostMapping("/{tenderId}/bid/submit")
    @RequirePermission(Permissions.BID_SUBMIT)
    fun submit(@PathVariable tenderId: UUID, ctx: AccessContext): TenderDto = tenders.submit(ctx, tenderId).toDto()

    @PostMapping("/{tenderId}/bid/withdraw")
    @RequirePermission(Permissions.BID_SUBMIT)
    fun withdraw(@PathVariable tenderId: UUID, ctx: AccessContext): TenderDto = tenders.withdraw(ctx, tenderId).toDto()

    private fun TenderView.toDto() = TenderDto(
        id = tender.id.toString(),
        title = tender.title,
        referenceNumber = tender.referenceNumber,
        description = tender.description,
        project = projectName,
        estimatedValue = tender.estimatedValue.toDto(),
        publishDate = tender.publishDate?.toString(),
        closingDate = tender.closingDate?.toString(),
        open = open,
        daysLeft = daysLeft,
        eligible = eligible,
        checks = checks.map { CheckDto(it.label, it.state.name, it.detail) },
        lines = lines.map { LineDto(it.description, it.quantity, it.unit) },
        bid = bid?.let { b ->
            BidDto(b.status.name, b.amount?.toDto(), b.validityDays, b.note,
                b.quotation?.let { QuotationDto(it.fileName, it.sizeBytes, it.uploadedAt.toString()) },
                b.submittedAt?.toString(), b.updatedAt.toString())
        },
        outcome = won?.let { if (it) "AWARDED_TO_YOU" else "NOT_SELECTED" },
        canEdit = canEdit,
        canSubmit = canSubmit,
        canWithdraw = canWithdraw,
        blockers = blockers,
        maxDocumentBytes = UploadRules.MAX_BYTES
    )
}
