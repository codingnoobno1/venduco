package com.vendorconnect.persistence.jpa.entity

import com.vendorconnect.persistence.jpa.converter.InstantStringConverter
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "projects")
class ProjectJpaEntity(
    @Id
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var id: UUID,
    
    var name: String,
    
    @Column(name = "corridor_name")
    var corridorName: String,
    
    @Column(name = "organization_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var organizationId: UUID,
    
    @Column(name = "project_head_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var projectHeadId: UUID,
    
    var status: String,
    
    @Column(name = "estimated_budget_minor")
    var estimatedBudgetMinor: Long,
    
    @Column(name = "estimated_budget_currency")
    var estimatedBudgetCurrency: String,
    
    @Column(name = "image_url")
    var imageUrl: String? = null,
    
    @Column(name = "created_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var updatedAt: Instant = Instant.now()
) {
    override fun equals(other: Any?): Boolean = this === other || (other is ProjectJpaEntity && id == other.id)
    override fun hashCode(): Int = id.hashCode()
    override fun toString(): String = "ProjectJpaEntity(id=$id, name=$name)"
}
