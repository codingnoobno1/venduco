package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.partner.QualificationApplication
import com.vendorconnect.domain.partner.QualificationDocument
import java.util.UUID

interface QualificationRepositoryPort {
    fun save(application: QualificationApplication): QualificationApplication
    fun findById(id: UUID): QualificationApplication?
    fun findFor(subject: SubjectRef): QualificationApplication?
    fun findAll(): List<QualificationApplication>

    /** Replaces whatever was in that application's slot for the same field. */
    fun putDocument(document: QualificationDocument): QualificationDocument?
    fun removeDocument(applicationId: UUID, fieldKey: String): QualificationDocument?
    fun findDocuments(applicationId: UUID): List<QualificationDocument>
}

/**
 * Protects values that must not sit in the database as entered (tax and bank identifiers).
 * What [protect] returns is safe to store; only [reveal] turns it back.
 */
interface SensitiveValuePort {
    fun protect(plain: String): String
    fun reveal(stored: String): String
}
