package com.vendorconnect.persistence.jpa.adapter

import com.vendorconnect.application.port.outbound.ProjectRepositoryPort
import com.vendorconnect.domain.project.Project
import com.vendorconnect.domain.project.ProjectStatus
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.persistence.jpa.entity.ProjectJpaEntity
import com.vendorconnect.persistence.jpa.repository.ProjectJpaRepository
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.util.Currency
import java.util.UUID
import java.time.Instant

@Component
class ProjectJpaAdapter(
    private val repository: ProjectJpaRepository
) : ProjectRepositoryPort {

    override fun findAll(): List<Project> {
        return repository.findAll().map { it.toDomain() }
    }

    override fun findById(id: UUID): Project? {
        return repository.findById(id).map { it.toDomain() }.orElse(null)
    }

    override fun save(project: Project): Project {
        // An update keeps the original creation time; only a new project gets "now".
        val createdAt = repository.findById(project.id).map { it.createdAt }.orElse(Instant.now())
        val entity = repository.save(project.toEntity(createdAt))
        return entity.toDomain()
    }

    private fun ProjectJpaEntity.toDomain() = Project(
        id = id,
        name = name,
        corridorName = corridorName,
        organizationId = organizationId,
        projectHeadId = projectHeadId,
        status = ProjectStatus.valueOf(status),
        estimatedBudget = Money(
            amount = BigDecimal.valueOf(estimatedBudgetMinor).divide(BigDecimal(100)),
            currency = Currency.getInstance(estimatedBudgetCurrency)
        ),
        imageUrl = imageUrl
    )

    private fun Project.toEntity(createdAt: Instant) = ProjectJpaEntity(
        id = id,
        name = name,
        corridorName = corridorName,
        organizationId = organizationId,
        projectHeadId = projectHeadId,
        status = status.name,
        estimatedBudgetMinor = estimatedBudget.amount.multiply(BigDecimal(100)).toLong(),
        estimatedBudgetCurrency = estimatedBudget.currency.currencyCode,
        imageUrl = imageUrl,
        createdAt = createdAt,
        updatedAt = Instant.now()
    )
}
