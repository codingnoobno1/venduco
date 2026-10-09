package com.vendorconnect.persistence.jpa.entity

import com.vendorconnect.persistence.jpa.converter.InstantStringConverter
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "audit_log")
class AuditLogJpaEntity(
    @Id
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var id: UUID,

    @Column(name = "occurred_at", nullable = false)
    @Convert(converter = InstantStringConverter::class)
    var occurredAt: Instant,

    @Column(name = "actor_user_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var actorUserId: UUID?,

    @Column(name = "assignment_id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    var assignmentId: UUID?,

    @Column(nullable = false)
    var action: String,

    @Column(name = "entity_type", nullable = false)
    var entityType: String,

    @Column(name = "entity_id", nullable = false)
    var entityId: String,

    @Column(nullable = false)
    var summary: String
) {
    override fun equals(other: Any?): Boolean = this === other || (other is AuditLogJpaEntity && id == other.id)

    override fun hashCode(): Int = id.hashCode()
}
