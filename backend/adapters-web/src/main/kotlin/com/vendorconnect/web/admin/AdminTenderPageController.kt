package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.BidRepositoryPort
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.application.usecase.project.ProjectUseCase
import com.vendorconnect.application.usecase.tender.BidEvaluationUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.tender.Tender
import com.vendorconnect.domain.tender.TenderStatus
import com.vendorconnect.security.RequirePermission
import com.vendorconnect.web.controller.PartnerQualificationController.Companion.toResponse
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.math.BigDecimal
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Tenders in the admin console. Bids stay sealed until a tender closes, exactly as on the buyer's side:
 * before then neither their amounts nor how many there are is shown here.
 */
@Controller
@RequestMapping("/admin/tenders")
class AdminTenderPageController(
    private val tenders: TenderRepositoryPort,
    private val bids: BidRepositoryPort,
    private val projects: ProjectUseCase,
    private val evaluations: BidEvaluationUseCase
) {

    data class TenderRow(
        val id: UUID,
        val reference: String,
        val title: String,
        val project: String,
        val projectId: UUID,
        val status: String,
        val stage: String?,
        val value: String,
        val closing: String?,
        val closingNote: String?,
        val bids: Int?
    )

    data class BidRow(
        val id: UUID,
        val rank: Int,
        val bidder: String,
        val isCompany: Boolean,
        val amount: String,
        val versusEstimate: String?,
        val versusLowest: String,
        val validUntil: String?,
        val expired: Boolean,
        val qualification: String?,
        val note: String?,
        val quotation: String?,
        val submittedAt: String?,
        val awarded: Boolean
    )

    data class LineRow(val description: String, val quantity: Long, val unit: String)

    @GetMapping
    @RequirePermission(Permissions.TENDER_READ)
    fun list(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) status: String?,
        ctx: AccessContext,
        model: Model
    ): String {
        val query = q.blankToNull()?.lowercase()
        val wanted = status.blankToNull()?.takeIf { s -> TenderStatus.entries.any { it.name == s } }
        val all = tenders.findAll()
        val projectNames = projects.listAll().associate { it.id to it.name }
        val canEvaluate = ctx.has(Permissions.BID_EVALUATE)

        val rows = all
            .filter { query == null || query in it.title.lowercase() || query in it.referenceNumber.lowercase() }
            .filter { wanted == null || it.status.name == wanted }
            .sortedWith(compareBy<Tender> { STATUS_ORDER.indexOf(it.status) }.thenBy { it.closingDate ?: LocalDate.MAX })
            .map { tender ->
                val evaluation = if (canEvaluate && tender.status !in NOT_EVALUATED) evaluations.evaluation(ctx, tender.id) else null
                TenderRow(
                    id = tender.id,
                    reference = tender.referenceNumber,
                    title = tender.title,
                    project = projectNames[tender.projectId] ?: "Unknown project",
                    projectId = tender.projectId,
                    status = tender.status.name,
                    stage = evaluation?.stage?.name,
                    value = tender.estimatedValue.display(),
                    closing = tender.closingDate?.toString(),
                    closingNote = closingNote(tender),
                    bids = evaluation?.bids?.size
                )
            }

        model.addAttribute("rows", rows)
        model.addAttribute("q", q.blankToNull())
        model.addAttribute("status", wanted)
        model.addAttribute("statuses", TenderStatus.entries.map { it.name })
        model.addAttribute("totalCount", all.size)
        model.addAttribute("openCount", all.count { it.status == TenderStatus.PUBLISHED })
        model.addAttribute("draftCount", all.count { it.status == TenderStatus.DRAFT })
        model.addAttribute("awardedCount", all.count { it.status == TenderStatus.AWARDED })
        model.addAttribute("awaitingAward", rows.count { it.stage == BidEvaluationUseCase.Stage.EVALUATION.name })
        model.addAttribute("canEvaluate", canEvaluate)
        return "admin/tenders"
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.TENDER_READ)
    fun detail(@PathVariable id: UUID, ctx: AccessContext, model: Model): String {
        val tender = tenders.findById(id) ?: throw EntityNotFoundException("Tender", id)
        val project = runCatching { projects.getById(tender.projectId) }.getOrNull()
        model.addAttribute("tender", tender)
        model.addAttribute("project", project)
        model.addAttribute("value", tender.estimatedValue.display())
        model.addAttribute("closingNote", closingNote(tender))
        model.addAttribute("lines", bids.findTenderLines(id).map { LineRow(it.description, it.quantity, it.unit) })

        if (ctx.has(Permissions.BID_EVALUATE) && tender.status !in NOT_EVALUATED) {
            val evaluation = evaluations.evaluation(ctx, id)
            model.addAttribute("evaluation", evaluation)
            model.addAttribute("bids", evaluation.bids?.map { r ->
                BidRow(
                    id = r.bid.id,
                    rank = r.rank,
                    bidder = r.bidder,
                    isCompany = r.isCompany,
                    amount = r.bid.amount!!.display(),
                    versusEstimate = r.versusEstimatePct?.let(::signedPercent),
                    versusLowest = if (r.versusLowestPct.signum() == 0) "Lowest" else signedPercent(r.versusLowestPct),
                    validUntil = r.offerValidUntil?.toString(),
                    expired = r.offerValidUntil?.isBefore(LocalDate.now()) == true,
                    qualification = r.qualification?.name,
                    note = r.bid.note,
                    quotation = r.bid.quotation?.fileName,
                    submittedAt = r.bid.submittedAt?.let { TIMESTAMP.format(it.atZone(ZoneId.systemDefault())) },
                    awarded = r.awarded
                )
            })
            model.addAttribute("award", evaluation.award?.let {
                mapOf("bidder" to (it.bidder ?: "(removed)"), "by" to it.awardedBy, "reason" to it.award.reason,
                    "at" to TIMESTAMP.format(it.award.awardedAt.atZone(ZoneId.systemDefault())))
            })
        }
        model.addAttribute("canEvaluate", ctx.has(Permissions.BID_EVALUATE))
        return "admin/tender"
    }

    @PostMapping("/{id}/award")
    @RequirePermission(Permissions.HIRING_AWARD)
    fun award(@PathVariable id: UUID, @RequestParam bidId: UUID, @RequestParam reason: String, ctx: AccessContext, redirect: RedirectAttributes): String {
        val evaluation = evaluations.award(ctx, id, bidId, reason)
        redirect.addFlashAttribute(Flash.SUCCESS, "${evaluation.tender.referenceNumber} awarded to ${evaluation.award?.bidder ?: "the chosen bidder"}.")
        return "redirect:/admin/tenders/$id"
    }

    @GetMapping("/{id}/bids/{bidId}/quotation")
    @RequirePermission(Permissions.BID_EVALUATE)
    @ResponseBody
    fun quotation(@PathVariable id: UUID, @PathVariable bidId: UUID): ResponseEntity<ByteArray> =
        evaluations.quotation(id, bidId).toResponse()

    private fun closingNote(tender: Tender): String? {
        val closing = tender.closingDate ?: return null
        if (tender.status != TenderStatus.PUBLISHED) return null
        val days = ChronoUnit.DAYS.between(LocalDate.now(), closing)
        return when {
            days < 0 -> "closed ${-days} day${if (days == -1L) "" else "s"} ago"
            days == 0L -> "closes today"
            else -> "$days day${if (days == 1L) "" else "s"} left"
        }
    }

    private fun signedPercent(value: BigDecimal): String = (if (value.signum() > 0) "+" else "") + value.toPlainString() + "%"

    private companion object {
        val NOT_EVALUATED = setOf(TenderStatus.DRAFT, TenderStatus.CANCELLED)
        val STATUS_ORDER = listOf(TenderStatus.PUBLISHED, TenderStatus.UNDER_REVIEW, TenderStatus.CLOSED, TenderStatus.DRAFT,
            TenderStatus.AWARDED, TenderStatus.CANCELLED)
        val TIMESTAMP: DateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")
    }
}
