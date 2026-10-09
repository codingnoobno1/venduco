package com.vendorconnect.persistence.jpa.entity

import com.vendorconnect.persistence.jpa.converter.LocalDateStringConverter
import com.vendorconnect.persistence.jpa.converter.LocalDateTimeStringConverter
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "tenders")
data class TenderJpaEntity(
    @Id
    @JdbcTypeCode(SqlTypes.VARCHAR)
    val id: String = "",

    @Column(nullable = false)
    val title: String = "",

    @Column(columnDefinition = "TEXT")
    val description: String = "",

    @Column(name = "reference_number", nullable = false, unique = true)
    val referenceNumber: String = "",

    @Column(name = "project_id", nullable = false)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    val projectId: String = "",

    @Column(name = "package_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    val packageId: String? = null,

    @Column(name = "estimated_value_minor", nullable = false)
    @JdbcTypeCode(SqlTypes.BIGINT)
    val estimatedValueAmount: Long = 0L,

    @Column(name = "estimated_value_currency")
    val estimatedValueCurrency: String = "INR",

    @Column(nullable = false)
    val status: String = "DRAFT",

    @Column(name = "publish_date")
    @Convert(converter = LocalDateStringConverter::class)
    val publishDate: LocalDate? = null,

    @Column(name = "closing_date")
    @Convert(converter = LocalDateStringConverter::class)
    val closingDate: LocalDate? = null,

    @Column(name = "ai_risk_score")
    val aiRiskScore: Double? = null,

    @Column(name = "created_at", nullable = false)
    @Convert(converter = LocalDateTimeStringConverter::class)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    @Convert(converter = LocalDateTimeStringConverter::class)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
