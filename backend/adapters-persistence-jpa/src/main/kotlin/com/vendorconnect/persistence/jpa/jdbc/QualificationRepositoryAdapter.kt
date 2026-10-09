package com.vendorconnect.persistence.jpa.jdbc

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.vendorconnect.application.port.outbound.QualificationRepositoryPort
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.partner.QualificationApplication
import com.vendorconnect.domain.partner.QualificationDocument
import com.vendorconnect.domain.partner.QualificationStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID

@Component
class QualificationRepositoryAdapter(
    private val jdbc: JdbcTemplate,
    private val json: ObjectMapper
) : QualificationRepositoryPort {

    private val answersType = object : TypeReference<Map<String, Any?>>() {}

    private val applicationMapper = RowMapper { rs, _ ->
        QualificationApplication(
            id = UUID.fromString(rs.getString("id")),
            subject = SubjectRef(SubjectType.valueOf(rs.getString("subject_type")), UUID.fromString(rs.getString("subject_id"))),
            status = QualificationStatus.valueOf(rs.getString("status")),
            version = rs.getInt("version"),
            templateVersion = rs.getInt("template_version"),
            answers = json.readValue(rs.getString("data_json"), answersType),
            submittedBy = rs.getString("submitted_by")?.let(UUID::fromString),
            submittedAt = rs.getString("submitted_at")?.let(Instant::parse),
            reviewNote = rs.getString("review_note"),
            decidedBy = rs.getString("decided_by")?.let(UUID::fromString),
            decidedAt = rs.getString("decided_at")?.let(Instant::parse),
            createdAt = Instant.parse(rs.getString("created_at")),
            updatedAt = Instant.parse(rs.getString("updated_at"))
        )
    }

    private val documentMapper = RowMapper { rs, _ ->
        QualificationDocument(
            id = UUID.fromString(rs.getString("id")),
            applicationId = UUID.fromString(rs.getString("application_id")),
            fieldKey = rs.getString("field_key"),
            fileName = rs.getString("file_name"),
            contentType = rs.getString("content_type"),
            sizeBytes = rs.getLong("size_bytes"),
            storagePath = rs.getString("storage_path"),
            uploadedBy = rs.getString("uploaded_by")?.let(UUID::fromString),
            uploadedAt = Instant.parse(rs.getString("uploaded_at"))
        )
    }

    override fun save(application: QualificationApplication): QualificationApplication {
        val a = application
        jdbc.update(
            """INSERT INTO qualification_applications (id, subject_type, subject_id, status, version, template_version, data_json,
                   submitted_by, submitted_at, review_note, decided_by, decided_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET status = excluded.status, version = excluded.version, data_json = excluded.data_json,
                   submitted_by = excluded.submitted_by, submitted_at = excluded.submitted_at, review_note = excluded.review_note,
                   decided_by = excluded.decided_by, decided_at = excluded.decided_at, updated_at = excluded.updated_at""",
            a.id.toString(), a.subject.type.name, a.subject.id.toString(), a.status.name, a.version, a.templateVersion,
            json.writeValueAsString(a.answers), a.submittedBy?.toString(), a.submittedAt?.toString(), a.reviewNote,
            a.decidedBy?.toString(), a.decidedAt?.toString(), a.createdAt.toString(), a.updatedAt.toString()
        )
        return a
    }

    override fun findById(id: UUID): QualificationApplication? =
        jdbc.query("SELECT * FROM qualification_applications WHERE id = ?", applicationMapper, id.toString()).firstOrNull()

    override fun findFor(subject: SubjectRef): QualificationApplication? =
        jdbc.query("SELECT * FROM qualification_applications WHERE subject_type = ? AND subject_id = ?", applicationMapper,
            subject.type.name, subject.id.toString()).firstOrNull()

    override fun findAll(): List<QualificationApplication> =
        jdbc.query("SELECT * FROM qualification_applications ORDER BY updated_at DESC", applicationMapper)

    override fun putDocument(document: QualificationDocument): QualificationDocument? {
        val replaced = removeDocument(document.applicationId, document.fieldKey)
        jdbc.update(
            """INSERT INTO qualification_documents (id, application_id, field_key, file_name, content_type, size_bytes,
                   storage_path, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            document.id.toString(), document.applicationId.toString(), document.fieldKey, document.fileName, document.contentType,
            document.sizeBytes, document.storagePath, document.uploadedBy?.toString(), document.uploadedAt.toString()
        )
        return replaced
    }

    override fun removeDocument(applicationId: UUID, fieldKey: String): QualificationDocument? {
        val existing = jdbc.query("SELECT * FROM qualification_documents WHERE application_id = ? AND field_key = ?",
            documentMapper, applicationId.toString(), fieldKey).firstOrNull() ?: return null
        jdbc.update("DELETE FROM qualification_documents WHERE id = ?", existing.id.toString())
        return existing
    }

    override fun findDocuments(applicationId: UUID): List<QualificationDocument> =
        jdbc.query("SELECT * FROM qualification_documents WHERE application_id = ?", documentMapper, applicationId.toString())
}
