package com.vendorconnect.persistence.jpa.jdbc

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.OrganizationRef
import com.vendorconnect.domain.account.ApprovalStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID

/** Plain SQL: organisations have no aggregate behaviour yet, so a JPA entity would only be ceremony. */
@Component
class OrganizationDirectoryAdapter(private val jdbc: JdbcTemplate) : OrganizationDirectoryPort {

    private val mapper = RowMapper { rs, _ ->
        OrganizationRef(
            id = UUID.fromString(rs.getString("id")),
            name = rs.getString("name"),
            code = rs.getString("code"),
            type = rs.getString("type"),
            approvalStatus = ApprovalStatus.valueOf(rs.getString("approval_status")),
            approvalNote = rs.getString("approval_note"),
            // Rows written by SQLite column defaults before V3 are not ISO-8601; they simply show no date.
            createdAt = rs.getString("created_at")?.let { runCatching { Instant.parse(it) }.getOrNull() }
        )
    }

    override fun findAll(): List<OrganizationRef> = jdbc.query("$SELECT ORDER BY name COLLATE NOCASE", mapper)

    override fun findById(id: UUID): OrganizationRef? =
        jdbc.query("$SELECT WHERE id = ?", mapper, id.toString()).firstOrNull()

    override fun create(name: String, type: String, approvalStatus: ApprovalStatus): OrganizationRef {
        val id = UUID.randomUUID()
        val now = Instant.now().toString()
        jdbc.update(
            "INSERT INTO organizations (id, name, code, type, is_active, approval_status, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?, ?)",
            id.toString(), name, codeFor(name, id), type, approvalStatus.name, now, now
        )
        return findById(id)!!
    }

    override fun updateApproval(id: UUID, status: ApprovalStatus, note: String?) {
        jdbc.update(
            "UPDATE organizations SET approval_status = ?, approval_note = ?, updated_at = ? WHERE id = ?",
            status.name, note, Instant.now().toString(), id.toString()
        )
    }

    /** Readable and unique: letters of the name plus a few characters of the id. */
    private fun codeFor(name: String, id: UUID): String {
        val stem = name.uppercase().filter { it in 'A'..'Z' || it.isDigit() }.take(CODE_STEM_LENGTH).ifEmpty { "ORG" }
        return "$stem-${id.toString().take(CODE_SUFFIX_LENGTH).uppercase()}"
    }

    private companion object {
        const val SELECT = "SELECT id, name, code, type, approval_status, approval_note, created_at FROM organizations"
        const val CODE_STEM_LENGTH = 8
        const val CODE_SUFFIX_LENGTH = 6
    }
}
