package com.vendorconnect.persistence.jpa.entity

import com.vendorconnect.persistence.jpa.converter.InstantStringConverter
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.NumericBooleanConverter
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

/**
 * JPA Entity for User — lives ONLY in the infrastructure layer.
 * Domain model (domain.model.user.User) has zero JPA annotations.
 *
 * A plain class (not a data class): JPA entities need identity-based equals/hashCode,
 * and a generated toString would print the password hash.
 * UUIDs and timestamps are mapped to TEXT and booleans to INTEGER 0/1, to match the SQLite schema.
 */
@Entity
@Table(name = "users")
class UserJpaEntity(
    @Id
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var id: UUID,

    @Column(nullable = false, unique = true)
    var email: String,

    @Column(name = "full_name", nullable = false)
    var fullName: String,

    @Column(name = "password_hash", nullable = false)
    var passwordHash: String,

    @Column(nullable = false)
    var role: String,

    @Column(name = "organization_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var organizationId: UUID?,

    @Column(name = "is_active", nullable = false)
    @Convert(converter = NumericBooleanConverter::class)
    var isActive: Boolean,

    @Column(name = "approval_status", nullable = false)
    var approvalStatus: String,

    @Column(name = "approval_note")
    var approvalNote: String?,

    @Column(name = "created_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var createdAt: Instant,

    @Column(name = "updated_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var updatedAt: Instant
) {
    override fun equals(other: Any?): Boolean = this === other || (other is UserJpaEntity && id == other.id)

    override fun hashCode(): Int = id.hashCode()

    override fun toString(): String = "UserJpaEntity(id=$id, email=$email, role=$role)"
}
