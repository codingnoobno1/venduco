package com.vendorconnect.persistence.jpa.converter

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

/**
 * Stores [Instant] as ISO-8601 TEXT, which is how the SQLite schema declares timestamp columns.
 * Hibernate's default mapping writes epoch millis into TEXT and then cannot read them back.
 *
 * Reading also accepts SQLite's `datetime('now')` format (`yyyy-MM-dd HH:mm:ss`, UTC) and
 * bare epoch millis, so rows created by column defaults or older code still load.
 */
@Converter
class InstantStringConverter : AttributeConverter<Instant, String> {

    override fun convertToDatabaseColumn(attribute: Instant?): String? = attribute?.toString()

    override fun convertToEntityAttribute(dbData: String?): Instant? {
        if (dbData.isNullOrBlank()) return null
        val value = dbData.trim()
        return when {
            value.all(Char::isDigit) -> Instant.ofEpochMilli(value.toLong())
            'T' in value -> Instant.parse(value)
            else -> LocalDateTime.parse(value, SQLITE_DATETIME).toInstant(ZoneOffset.UTC)
        }
    }

    private companion object {
        val SQLITE_DATETIME: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss[.SSS]")
    }
}
