package com.vendorconnect.application.usecase.partner

import com.vendorconnect.application.port.outbound.FileStoragePort
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.QualificationRepositoryPort
import com.vendorconnect.application.port.outbound.SensitiveValuePort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.domain.shared.ConflictException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.FieldErrorsException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.partner.FieldDef
import com.vendorconnect.domain.partner.FieldType
import com.vendorconnect.domain.partner.QualificationApplication
import com.vendorconnect.domain.partner.QualificationDocument
import com.vendorconnect.domain.partner.QualificationStatus
import com.vendorconnect.domain.partner.QualificationTemplate
import com.vendorconnect.domain.partner.StepDef
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.ByteArrayInputStream
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * A partner's qualification application: filled in step by step, saved as a draft at any point,
 * and submitted once nothing required is missing. After submission it is locked until a reviewer
 * decides on it or sends it back for correction.
 *
 * An application belongs to the caller's company, or to the caller personally if they have none,
 * and that owner is always taken from who is signed in, never from the request.
 */
@Service
class QualificationUseCase(
    private val applications: QualificationRepositoryPort,
    private val storage: FileStoragePort,
    private val cipher: SensitiveValuePort,
    private val users: UserRepositoryPort,
    private val organizations: OrganizationDirectoryPort,
    private val audit: AuditRecorder
) {

    enum class StepState { NOT_STARTED, IN_PROGRESS, COMPLETED }

    data class FieldView(
        val def: FieldDef,
        /** The stored answer; always null for sensitive fields, which expose [masked] instead. */
        val value: Any?,
        val masked: String?,
        val document: QualificationDocument?,
        /** Whether it is required given the other answers so far. */
        val required: Boolean,
        val satisfied: Boolean
    )

    data class StepView(val def: StepDef, val state: StepState, val fields: List<FieldView>)

    data class MissingItem(val step: StepDef, val field: FieldDef)

    data class ApplicationView(
        val application: QualificationApplication?,
        val applicant: String,
        val status: QualificationStatus,
        val steps: List<StepView>,
        val missing: List<MissingItem>
    ) {
        val editable: Boolean get() = status.editable
        val completedSteps: Int get() = steps.count { it.state == StepState.COMPLETED }
        val canSubmit: Boolean get() = editable && missing.isEmpty()
    }

    data class DocumentContent(val fileName: String, val contentType: String, val bytes: ByteArray)

    // ── Partner side ──

    @Transactional(readOnly = true)
    fun mine(ctx: AccessContext): ApplicationView = view(applications.findFor(subjectOf(ctx)), subjectOf(ctx))

    /**
     * Saves the answers of one step. Nothing has to be complete, but what is given has to be valid:
     * a draft with a malformed PAN would only fail later, at the worst moment.
     * A sensitive field left blank keeps its stored value.
     */
    @Transactional
    fun saveStep(ctx: AccessContext, stepKey: String, incoming: Map<String, Any?>): ApplicationView {
        val step = QualificationTemplate.step(stepKey) ?: throw EntityNotFoundException("Step", stepKey)
        val current = editableApplication(ctx)

        val answers = current.answers.toMutableMap()
        val errors = linkedMapOf<String, String>()
        step.fields.filter { it.type != FieldType.DOCUMENT && it.key in incoming }.forEach { field ->
            try {
                when (val normalised = normalise(field, incoming[field.key])) {
                    null -> if (!field.sensitive) answers.remove(field.key)
                    else -> answers[field.key] = if (field.sensitive) cipher.protect(normalised as String) else normalised
                }
            } catch (e: InvalidAnswer) {
                errors[field.key] = e.message!!
            }
        }
        if (errors.isNotEmpty()) throw FieldErrorsException(errors)

        return view(applications.save(current.copy(answers = answers, updatedAt = Instant.now())), current.subject)
    }

    @Transactional
    fun uploadDocument(ctx: AccessContext, fieldKey: String, fileName: String, bytes: ByteArray): ApplicationView {
        val field = documentField(fieldKey)
        val current = editableApplication(ctx)
        requireDomain(bytes.isNotEmpty()) { "The file is empty." }
        requireDomain(bytes.size <= MAX_DOCUMENT_BYTES) { "The file is larger than ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB." }
        val contentType = UploadRules.sniff(bytes) ?: throw FieldErrorsException(mapOf(field.key to UploadRules.REFUSAL))

        applications.save(current.copy(updatedAt = Instant.now()))  // makes sure the application row exists
        val path = storage.store(fileName, ByteArrayInputStream(bytes), contentType)
        val replaced = applications.putDocument(
            QualificationDocument(applicationId = current.id, fieldKey = field.key, fileName = UploadRules.displayName(fileName),
                contentType = contentType, sizeBytes = bytes.size.toLong(), storagePath = path, uploadedBy = ctx.userId)
        )
        replaced?.let { storage.delete(it.storagePath) }
        return view(applications.findById(current.id), current.subject)
    }

    @Transactional
    fun removeDocument(ctx: AccessContext, fieldKey: String): ApplicationView {
        val current = editableApplication(ctx)
        applications.removeDocument(current.id, documentField(fieldKey).key)?.let { storage.delete(it.storagePath) }
        return view(applications.findById(current.id) ?: current, current.subject)
    }

    @Transactional(readOnly = true)
    fun myDocument(ctx: AccessContext, fieldKey: String): DocumentContent {
        val application = applications.findFor(subjectOf(ctx)) ?: throw EntityNotFoundException("Document", fieldKey)
        return content(application.id, fieldKey)
    }

    @Transactional
    fun submit(ctx: AccessContext, declaredAccurate: Boolean, consentToShare: Boolean): ApplicationView {
        val current = editableApplication(ctx)
        val missing = view(current, current.subject).missing
        requireDomain(missing.isEmpty()) {
            "${missing.size} required item(s) are still missing, starting with \"${missing.first().field.label}\"."
        }
        requireDomain(declaredAccurate && consentToShare) { "Both declarations have to be accepted before submitting." }

        val resubmission = current.status == QualificationStatus.CORRECTION_REQUIRED
        val saved = applications.save(
            current.copy(
                status = QualificationStatus.SUBMITTED,
                version = if (resubmission) current.version + 1 else current.version,
                submittedBy = ctx.userId,
                submittedAt = Instant.now(),
                reviewNote = null,
                updatedAt = Instant.now()
            )
        )
        audit.record(ctx, "QUALIFICATION_SUBMITTED", ENTITY, saved.id, "${applicantName(saved.subject)} submitted version ${saved.version}")
        return view(saved, saved.subject)
    }

    /** Where a company's (or individual's) qualification stands, or null if they have not started one. */
    @Transactional(readOnly = true)
    fun statusOf(subject: SubjectRef): QualificationStatus? = applications.findFor(subject)?.status

    // ── Reviewer side (callers hold `qualification:decide` or `qualification:read`) ──

    @Transactional(readOnly = true)
    fun all(): List<ApplicationView> = applications.findAll().map { view(it, it.subject) }

    @Transactional(readOnly = true)
    fun byId(id: UUID): ApplicationView =
        (applications.findById(id) ?: throw EntityNotFoundException("Application", id)).let { view(it, it.subject) }

    @Transactional(readOnly = true)
    fun document(applicationId: UUID, fieldKey: String): DocumentContent = content(applicationId, fieldKey)

    @Transactional
    fun decide(ctx: AccessContext, id: UUID, decision: QualificationStatus, note: String?): ApplicationView {
        val current = applications.findById(id) ?: throw EntityNotFoundException("Application", id)
        if (current.status != QualificationStatus.SUBMITTED) throw ConflictException("Only a submitted application can be decided on.")
        requireDomain(decision in DECISIONS) { "Choose approve, reject or request correction." }
        requireDomain(decision == QualificationStatus.APPROVED || !note.isNullOrBlank()) { "Tell the partner what needs to change, or why it was rejected." }
        requireDomain((note?.length ?: 0) <= MAX_NOTE) { "The note is too long." }
        requireDomain(current.submittedBy != ctx.userId) { "You cannot decide on an application you submitted yourself." }

        val saved = applications.save(
            current.copy(status = decision, reviewNote = note?.trim()?.ifEmpty { null }, decidedBy = ctx.userId,
                decidedAt = Instant.now(), updatedAt = Instant.now())
        )
        audit.record(ctx, "QUALIFICATION_${decision.name}", ENTITY, id,
            "${applicantName(saved.subject)} version ${saved.version}: SUBMITTED → $decision" + (saved.reviewNote?.let { " ($it)" } ?: ""))
        return view(saved, saved.subject)
    }

    // ── Internals ──

    private fun subjectOf(ctx: AccessContext): SubjectRef =
        ctx.organizationId?.let { SubjectRef(SubjectType.ORGANIZATION, it) } ?: SubjectRef(SubjectType.USER, ctx.userId)

    private fun editableApplication(ctx: AccessContext): QualificationApplication {
        val subject = subjectOf(ctx)
        val current = applications.findFor(subject) ?: QualificationApplication(subject = subject)
        if (!current.status.editable) {
            throw ConflictException("The application has been submitted and cannot be changed unless a correction is requested.")
        }
        return current
    }

    private fun documentField(fieldKey: String): FieldDef =
        QualificationTemplate.field(fieldKey)?.takeIf { it.type == FieldType.DOCUMENT } ?: throw EntityNotFoundException("Document", fieldKey)

    private fun content(applicationId: UUID, fieldKey: String): DocumentContent {
        val document = applications.findDocuments(applicationId).firstOrNull { it.fieldKey == fieldKey }
            ?: throw EntityNotFoundException("Document", fieldKey)
        val bytes = storage.retrieve(document.storagePath) ?: throw EntityNotFoundException("Document", fieldKey)
        return DocumentContent(document.fileName, document.contentType, bytes)
    }

    private fun applicantName(subject: SubjectRef): String = when (subject.type) {
        SubjectType.ORGANIZATION -> organizations.findById(subject.id)?.name
        SubjectType.USER -> users.findById(subject.id)?.let { "${it.fullName} <${it.email}>" }
    } ?: "(removed)"

    private fun view(application: QualificationApplication?, subject: SubjectRef): ApplicationView {
        val answers = application?.answers.orEmpty()
        val documents = application?.let { applications.findDocuments(it.id) }.orEmpty().associateBy { it.fieldKey }

        val steps = QualificationTemplate.steps.map { step ->
            val fields = step.fields.map { field ->
                val stored = answers[field.key]
                val required = field.required && (field.requiredWhen == null || answers[field.requiredWhen!!.field] == field.requiredWhen!!.equals)
                val satisfied = if (field.type == FieldType.DOCUMENT) field.key in documents else hasAnswer(stored)
                FieldView(
                    def = field,
                    value = stored.takeUnless { field.sensitive },
                    masked = (stored as? String)?.takeIf { field.sensitive }?.let { mask(cipher.reveal(it)) },
                    document = documents[field.key],
                    required = required,
                    satisfied = satisfied
                )
            }
            val state = when {
                fields.none { it.satisfied } -> StepState.NOT_STARTED
                fields.all { !it.required || it.satisfied } -> StepState.COMPLETED
                else -> StepState.IN_PROGRESS
            }
            StepView(step, state, fields)
        }
        return ApplicationView(
            application = application,
            applicant = applicantName(subject),
            status = application?.status ?: QualificationStatus.DRAFT,
            steps = steps,
            missing = steps.flatMap { step -> step.fields.filter { it.required && !it.satisfied }.map { MissingItem(step.def, it.def) } }
        )
    }

    private fun hasAnswer(value: Any?): Boolean = when (value) {
        is String -> value.isNotBlank()
        is Collection<*> -> value.isNotEmpty()
        else -> false
    }

    /** Shows only the last four characters, enough to recognise the value without disclosing it. */
    private fun mask(plain: String): String = "•••• " + plain.takeLast(VISIBLE_TAIL)

    private class InvalidAnswer(message: String) : RuntimeException(message)

    /** @return the value to store, or null when the answer was cleared (or, for a sensitive field, left untouched). */
    private fun normalise(field: FieldDef, raw: Any?): Any? {
        if (field.type == FieldType.MULTI_SELECT) {
            val chosen = (raw as? Collection<*>)?.mapNotNull { (it as? String)?.trim() }?.filter { it.isNotEmpty() }?.distinct()
                ?: if (raw == null) emptyList() else throw InvalidAnswer("Choose from the list.")
            if (!field.options.containsAll(chosen)) throw InvalidAnswer("Choose from the list.")
            return chosen.ifEmpty { null }
        }
        val text = when (raw) {
            null -> ""
            is String -> raw.trim()
            is Number, is Boolean -> raw.toString()
            else -> throw InvalidAnswer("Enter a single value.")
        }.let { if (field.upperCase) it.uppercase() else it }
        if (text.isEmpty()) return null
        if (text.length > MAX_ANSWER) throw InvalidAnswer("Keep this under $MAX_ANSWER characters.")

        when (field.type) {
            FieldType.SELECT -> if (text !in field.options) throw InvalidAnswer("Choose from the list.")
            FieldType.YES_NO -> if (text != "YES" && text != "NO") throw InvalidAnswer("Answer yes or no.")
            FieldType.NUMBER -> {
                val number = text.replace(",", "").toBigDecimalOrNull() ?: throw InvalidAnswer("Enter a number.")
                if (number.signum() < 0) throw InvalidAnswer("This cannot be negative.")
                return number.stripTrailingZeros().toPlainString()
            }
            FieldType.DATE -> {
                val date = runCatching { LocalDate.parse(text) }.getOrElse { throw InvalidAnswer("Enter a valid date.") }
                if (date.isAfter(LocalDate.now())) throw InvalidAnswer("This date cannot be in the future.")
            }
            FieldType.EMAIL -> if (!EMAIL.matches(text)) throw InvalidAnswer("Enter a valid email address.")
            FieldType.PHONE -> if (!PHONE.matches(text)) throw InvalidAnswer("Enter a phone number of 8 to 15 digits.")
            else -> Unit
        }
        field.pattern?.let { if (!it.matches(text)) throw InvalidAnswer(field.patternMessage ?: "This is not in the expected format.") }
        return text
    }

    companion object {
        const val MAX_DOCUMENT_BYTES = UploadRules.MAX_BYTES
        private const val ENTITY = "QUALIFICATION"
        private const val MAX_ANSWER = 500
        private const val MAX_NOTE = 500
        private const val VISIBLE_TAIL = 4
        private val DECISIONS = setOf(QualificationStatus.APPROVED, QualificationStatus.REJECTED, QualificationStatus.CORRECTION_REQUIRED)
        private val EMAIL = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
        private val PHONE = Regex("^\\+?[0-9][0-9 -]{6,16}[0-9]$")
    }
}
