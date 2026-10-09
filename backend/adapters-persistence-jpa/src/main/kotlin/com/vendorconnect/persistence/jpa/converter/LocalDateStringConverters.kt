package com.vendorconnect.persistence.jpa.converter

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

/**
 * Stores [LocalDate] as ISO-8601 TEXT (`yyyy-MM-dd`), which is how the SQLite schema declares date columns.
 * Hibernate cannot read a TEXT value back into a LocalDate on its own.
 *
 * Reading also tolerates a full timestamp (`yyyy-MM-ddTHH:mm...`, `yyyy-MM-dd HH:mm:ss`) and epoch millis.
 */
@Converter
class LocalDateStringConverter : AttributeConverter<LocalDate, String> {

    override fun convertToDatabaseColumn(attribute: LocalDate?): String? = attribute?.toString()

    override fun convertToEntityAttribute(dbData: String?): LocalDate? {
        if (dbData.isNullOrBlank()) return null
        val value = dbData.trim()
        return when {
            value.all(Char::isDigit) -> Instant.ofEpochMilli(value.toLong()).atOffset(ZoneOffset.UTC).toLocalDate()
            else -> LocalDate.parse(value.take(DATE_LENGTH))
        }
    }

    private companion object {
        const val DATE_LENGTH = 10 // yyyy-MM-dd
    }
}

/**
 * Stores [LocalDateTime] as ISO-8601 TEXT.
 *
 * Reading accepts ISO local (`2026-10-01T09:00:00.123`), UTC instants with a `Z` suffix (the SQLite column
 * defaults), SQLite's `datetime('now')` format (`yyyy-MM-dd HH:mm:ss[.SSS]`) and epoch millis.
 */
@Converter
class LocalDateTimeStringConverter : AttributeConverter<LocalDateTime, String> {

    override fun convertToDatabaseColumn(attribute: LocalDateTime?): String? = attribute?.toString()

    override fun convertToEntityAttribute(dbData: String?): LocalDateTime? {
        if (dbData.isNullOrBlank()) return null
        val value = dbData.trim()
        return when {
            value.all(Char::isDigit) -> LocalDateTime.ofInstant(Instant.ofEpochMilli(value.toLong()), ZoneOffset.UTC)
            value.endsWith('Z') -> LocalDateTime.ofInstant(Instant.parse(value), ZoneOffset.UTC)
            'T' in value -> LocalDateTime.parse(value)
            else -> LocalDateTime.parse(value, SQLITE_DATETIME)
        }
    }

    private companion object {
        val SQLITE_DATETIME: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss[.SSS]")
    }
}
