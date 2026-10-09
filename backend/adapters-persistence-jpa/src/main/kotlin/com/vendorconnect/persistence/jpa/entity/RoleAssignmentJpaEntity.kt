package com.vendorconnect.persistence.jpa.entity

import com.vendorconnect.persistence.jpa.converter.InstantStringConverter
import com.vendorconnect.persistence.jpa.converter.LocalDateStringConverter
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "role_assignments")
class RoleAssignmentJpaEntity(
    @Id
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var id: UUID,

    @Column(name = "user_id", nullable = false)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var userId: UUID,

    @Column(name = "role_id", nullable = false)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var roleId: UUID,

    @Column(name = "organization_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var organizationId: UUID?,

    @Column(name = "project_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var projectId: UUID?,

    @Column(name = "scope_type", nullable = false)
    var scopeType: String,

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "assignment_scopes", joinColumns = [JoinColumn(name = "assignment_id")])
    @Column(name = "scope_ref", nullable = false)
    var scopeRefs: MutableSet<String> = mutableSetOf(),

    @Column(name = "access_level", nullable = false)
    var accessLevel: String,

    @Column(name = "approval_limit_minor")
    var approvalLimitMinor: Long?,

    @Column(name = "approval_limit_currency")
    var approvalLimitCurrency: String?,

    @Column(name = "reviewer_user_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var reviewerUserId: UUID?,

    @Column(name = "valid_from", nullable = false)
    @Convert(converter = LocalDateStringConverter::class)
    var validFrom: LocalDate,

    @Column(name = "valid_until")
    @Convert(converter = LocalDateStringConverter::class)
    var validUntil: LocalDate?,

    @Column(nullable = false)
    var status: String,

    @Column(nullable = false)
    var source: String,

    @Column(name = "created_by")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var createdBy: UUID?,

    @Column(name = "created_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var createdAt: Instant,

    @Column(name = "updated_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var updatedAt: Instant
) {
    override fun equals(other: Any?): Boolean = this === other || (other is RoleAssignmentJpaEntity && id == other.id)

    override fun hashCode(): Int = id.hashCode()

    override fun toString(): String = "RoleAssignmentJpaEntity(id=$id, userId=$userId, roleId=$roleId)"
}
