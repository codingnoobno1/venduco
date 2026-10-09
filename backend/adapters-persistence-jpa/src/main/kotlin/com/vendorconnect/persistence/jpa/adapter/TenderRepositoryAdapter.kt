package com.vendorconnect.persistence.jpa.adapter

import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.domain.tender.Tender
import com.vendorconnect.domain.tender.TenderStatus
import com.vendorconnect.persistence.jpa.entity.TenderJpaEntity
import com.vendorconnect.persistence.jpa.repository.TenderJpaRepository
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.util.Currency
import java.util.UUID

@Component
class TenderRepositoryAdapter(
    private val jpaRepository: TenderJpaRepository
) : TenderRepositoryPort {

    override fun save(tender: Tender): Tender {
        val entity = tender.toEntity()
        val saved = jpaRepository.save(entity)
        return saved.toDomain()
    }

    override fun findById(id: UUID): Tender? {
        return jpaRepository.findById(id.toString()).orElse(null)?.toDomain()
    }

    override fun findByProjectId(projectId: UUID): List<Tender> {
        return jpaRepository.findByProjectId(projectId.toString()).map { it.toDomain() }
    }

    override fun findAll(): List<Tender> {
        return jpaRepository.findAll().map { it.toDomain() }
    }

    override fun deleteById(id: UUID) {
        jpaRepository.deleteById(id.toString())
    }

    // ---- Mappers ----

    private fun Tender.toEntity() = TenderJpaEntity(
        id = id.toString(),
        title = title,
        description = description,
        referenceNumber = referenceNumber,
        projectId = projectId.toString(),
        packageId = packageId?.toString(),
        estimatedValueAmount = estimatedValue.toMinorUnits(),
        estimatedValueCurrency = estimatedValue.currency.currencyCode,
        status = status.name,
        publishDate = publishDate,
        closingDate = closingDate,
        aiRiskScore = aiAnalysis?.riskScore
    )

    private fun TenderJpaEntity.toDomain() = Tender(
        id = UUID.fromString(id),
        title = title,
        description = description,
        referenceNumber = referenceNumber,
        projectId = UUID.fromString(projectId),
        packageId = packageId?.let { UUID.fromString(it) },
        estimatedValue = Money.ofMinorUnits(estimatedValueAmount, Currency.getInstance(estimatedValueCurrency)),
        status = TenderStatus.valueOf(status),
        publishDate = publishDate,
        closingDate = closingDate,
        // Assuming AI Analysis mapping will be enriched later if needed, but for now we only store risk score
        aiAnalysis = aiRiskScore?.let { 
            com.vendorconnect.domain.tender.TenderAiAnalysis(
                riskScore = it, 
                extractedEntities = emptyList(), 
                recommendations = emptyList()
            ) 
        }
    )
}
