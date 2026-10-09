package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.partner.QualificationUseCase
import com.vendorconnect.application.usecase.partner.QualificationUseCase.ApplicationView
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.security.RequirePermission
import org.springframework.http.CacheControl
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

/**
 * The signed-in partner's own qualification application. There is no id in any path: whose
 * application it is follows from who is signed in.
 */
@RestController
@RequestMapping("/api/v1/partner/qualification")
class PartnerQualificationController(private val qualification: QualificationUseCase) {

    data class RequiredWhenDto(val field: String, val equals: String)

    data class DocumentDto(val fileName: String, val contentType: String, val sizeBytes: Long, val uploadedAt: String)

    data class FieldDto(
        val key: String,
        val label: String,
        val type: String,
        val required: Boolean,
        val options: List<String>,
        val hint: String?,
        val sensitive: Boolean,
        val requiredWhen: RequiredWhenDto?,
        val value: Any?,
        val maskedValue: String?,
        val document: DocumentDto?,
        val satisfied: Boolean
    )

    data class StepDto(val key: String, val title: String, val shortTitle: String, val intro: String, val state: String,
                       val fields: List<FieldDto>)

    data class MissingDto(val stepKey: String, val stepTitle: String, val fieldKey: String, val label: String, val kind: String)

    data class ApplicationDto(
        val applicant: String,
        val status: String,
        val version: Int,
        val editable: Boolean,
        val canSubmit: Boolean,
        val submittedAt: String?,
        val reviewNote: String?,
        val lastSavedAt: String?,
        val sectionsCompleted: Int,
        val sectionsTotal: Int,
        val maxDocumentBytes: Int,
        val steps: List<StepDto>,
        val missing: List<MissingDto>
    )

    data class SaveStepRequest(val values: Map<String, Any?> = emptyMap())

    data class SubmitRequest(val declaredAccurate: Boolean = false, val consentToShare: Boolean = false)

    @GetMapping
    @RequirePermission(Permissions.QUALIFICATION_SUBMIT)
    fun mine(ctx: AccessContext): ApplicationDto = qualification.mine(ctx).toDto()

    @PutMapping("/steps/{stepKey}")
    @RequirePermission(Permissions.QUALIFICATION_SUBMIT)
    fun saveStep(@PathVariable stepKey: String, @RequestBody request: SaveStepRequest, ctx: AccessContext): ApplicationDto =
        qualification.saveStep(ctx, stepKey, request.values).toDto()

    @PostMapping("/documents/{fieldKey}", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @RequirePermission(Permissions.QUALIFICATION_SUBMIT)
    fun upload(@PathVariable fieldKey: String, @RequestParam file: MultipartFile, ctx: AccessContext): ApplicationDto =
        qualification.uploadDocument(ctx, fieldKey, file.originalFilename.orEmpty(), file.bytes).toDto()

    @DeleteMapping("/documents/{fieldKey}")
    @RequirePermission(Permissions.QUALIFICATION_SUBMIT)
    fun removeDocument(@PathVariable fieldKey: String, ctx: AccessContext): ApplicationDto =
        qualification.removeDocument(ctx, fieldKey).toDto()

    @GetMapping("/documents/{fieldKey}/content")
    @RequirePermission(Permissions.QUALIFICATION_SUBMIT)
    fun document(@PathVariable fieldKey: String, ctx: AccessContext): ResponseEntity<ByteArray> =
        qualification.myDocument(ctx, fieldKey).toResponse()

    @PostMapping("/submit")
    @RequirePermission(Permissions.QUALIFICATION_SUBMIT)
    fun submit(@RequestBody request: SubmitRequest, ctx: AccessContext): ApplicationDto =
        qualification.submit(ctx, request.declaredAccurate, request.consentToShare).toDto()

    companion object {
        /** Sent as a download with sniffing off: an uploaded file is never rendered as a page from this origin. */
        fun QualificationUseCase.DocumentContent.toResponse(): ResponseEntity<ByteArray> = ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(fileName, Charsets.UTF_8).build().toString())
            .header("X-Content-Type-Options", "nosniff")
            .cacheControl(CacheControl.noStore())
            .body(bytes)

        fun ApplicationView.toDto() = ApplicationDto(
            applicant = applicant,
            status = status.name,
            version = application?.version ?: 1,
            editable = editable,
            canSubmit = canSubmit,
            submittedAt = application?.submittedAt?.toString(),
            reviewNote = application?.reviewNote,
            lastSavedAt = application?.updatedAt?.toString(),
            sectionsCompleted = completedSteps,
            sectionsTotal = steps.size,
            maxDocumentBytes = QualificationUseCase.MAX_DOCUMENT_BYTES,
            steps = steps.map { step ->
                StepDto(step.def.key, step.def.title, step.def.shortTitle, step.def.intro, step.state.name, step.fields.map { f ->
                    FieldDto(
                        key = f.def.key,
                        label = f.def.label,
                        type = f.def.type.name,
                        required = f.required,
                        options = f.def.options,
                        hint = f.def.hint,
                        sensitive = f.def.sensitive,
                        requiredWhen = f.def.requiredWhen?.let { RequiredWhenDto(it.field, it.equals) },
                        value = f.value,
                        maskedValue = f.masked,
                        document = f.document?.let { DocumentDto(it.fileName, it.contentType, it.sizeBytes, it.uploadedAt.toString()) },
                        satisfied = f.satisfied
                    )
                })
            },
            missing = missing.map {
                MissingDto(it.step.key, it.step.title, it.field.key, it.field.label,
                    if (it.field.type == com.vendorconnect.domain.partner.FieldType.DOCUMENT) "DOCUMENT" else "ANSWER")
            }
        )
    }
}
