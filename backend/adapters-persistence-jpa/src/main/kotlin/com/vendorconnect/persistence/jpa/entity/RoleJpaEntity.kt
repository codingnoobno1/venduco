package com.vendorconnect.persistence.jpa.entity

import com.vendorconnect.persistence.jpa.converter.InstantStringConverter
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.NumericBooleanConverter
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "roles")
class RoleJpaEntity(
    @Id
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var id: UUID,

    @Column(name = "role_key", nullable = false, unique = true)
    var roleKey: String,

    @Column(nullable = false)
    var name: String,

    var description: String?,

    @Column(nullable = false)
    var portal: String,

    @Column(name = "scope_level", nullable = false)
    var scopeLevel: String,

    @Column(name = "is_system", nullable = false)
    @Convert(converter = NumericBooleanConverter::class)
    var isSystem: Boolean,

    @Column(name = "organization_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var organizationId: UUID?,

    @Column(name = "default_dashboard_key")
    var defaultDashboardKey: String?,

    @Column(name = "is_active", nullable = false)
    @Convert(converter = NumericBooleanConverter::class)
    var isActive: Boolean,

    // Eager: a role is never useful without its permissions, and open-in-view is off.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = [JoinColumn(name = "role_id")])
    @Column(name = "permission_key", nullable = false)
    var permissions: MutableSet<String> = mutableSetOf(),

    @Column(name = "created_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var createdAt: Instant,

    @Column(name = "updated_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var updatedAt: Instant
) {
    override fun equals(other: Any?): Boolean = this === other || (other is RoleJpaEntity && id == other.id)

    override fun hashCode(): Int = id.hashCode()

    override fun toString(): String = "RoleJpaEntity(id=$id, key=$roleKey)"
}
