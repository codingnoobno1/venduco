package com.vendorconnect.web.admin

import com.vendorconnect.application.usecase.partner.QualificationUseCase
import com.vendorconnect.application.usecase.partner.QualificationUseCase.ApplicationView
import com.vendorconnect.web.controller.PartnerQualificationController.Companion.toResponse
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.partner.FieldType
import com.vendorconnect.domain.partner.QualificationStatus
import com.vendorconnect.security.RequirePermission
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

/** Review of partner qualification applications: read what was submitted, then approve, reject or send back. */
@Controller
@RequestMapping("/admin/qualifications")
class AdminQualificationPageController(private val qualification: QualificationUseCase) {

    data class Row(val id: UUID, val applicant: String, val status: String, val version: Int, val progress: String,
                   val submitted: String?, val updated: String)

    data class Answer(val label: String, val value: String?, val fieldKey: String, val isDocument: Boolean, val fileName: String?,
                      val required: Boolean, val satisfied: Boolean)

    data class Section(val title: String, val state: String, val answers: List<Answer>)

    @GetMapping
    @RequirePermission(Permissions.QUALIFICATION_READ)
    fun list(@RequestParam(required = false) show: String?, model: Model): String {
        val all = qualification.all()
        val waiting = show != SHOW_ALL
        model.addAttribute("rows", all.filter { !waiting || it.status == QualificationStatus.SUBMITTED }.map(::row))
        model.addAttribute("show", if (waiting) SHOW_WAITING else SHOW_ALL)
        model.addAttribute("waitingCount", all.count { it.status == QualificationStatus.SUBMITTED })
        model.addAttribute("totalCount", all.size)
        return "admin/qualifications"
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.QUALIFICATION_READ)
    fun detail(@PathVariable id: UUID, ctx: AccessContext, model: Model): String {
        val view = qualification.byId(id)
        model.addAttribute("q", row(view))
        model.addAttribute("reviewNote", view.application?.reviewNote)
        model.addAttribute("sections", view.steps.map { step ->
            Section(step.def.title, step.state.name, step.fields.map { f ->
                Answer(
                    label = f.def.label,
                    // Sensitive answers are shown masked here too; this page is not the place they are disclosed.
                    value = f.masked ?: when (val v = f.value) {
                        is Collection<*> -> v.joinToString(", ")
                        null -> null
                        else -> v.toString()
                    },
                    fieldKey = f.def.key,
                    isDocument = f.def.type == FieldType.DOCUMENT,
                    fileName = f.document?.fileName,
                    required = f.required,
                    satisfied = f.satisfied
                )
            })
        })
        model.addAttribute("canDecide", ctx.has(Permissions.QUALIFICATION_DECIDE) && view.status == QualificationStatus.SUBMITTED)
        return "admin/qualification"
    }

    @GetMapping("/{id}/documents/{fieldKey}")
    @RequirePermission(Permissions.QUALIFICATION_READ)
    fun document(@PathVariable id: UUID, @PathVariable fieldKey: String): ResponseEntity<ByteArray> =
        qualification.document(id, fieldKey).toResponse()

    @PostMapping("/{id}/decision")
    @RequirePermission(Permissions.QUALIFICATION_DECIDE)
    fun decide(@PathVariable id: UUID, @RequestParam decision: QualificationStatus, @RequestParam(required = false) note: String?,
               ctx: AccessContext, redirect: RedirectAttributes): String {
        val view = qualification.decide(ctx, id, decision, note)
        redirect.addFlashAttribute(Flash.SUCCESS, "${view.applicant}: ${view.status.label().lowercase()}.")
        return "redirect:/admin/qualifications/$id"
    }

    private fun row(view: ApplicationView): Row {
        val a = view.application!!
        return Row(a.id, view.applicant, view.status.name, a.version, "${view.completedSteps} of ${view.steps.size}",
            a.submittedAt?.let { DATE.format(it.atZone(ZoneId.systemDefault())) }, DATE.format(a.updatedAt.atZone(ZoneId.systemDefault())))
    }

    private companion object {
        const val SHOW_WAITING = "waiting"
        const val SHOW_ALL = "all"
        val DATE: DateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")
    }
}
