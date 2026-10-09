package com.vendorconnect.domain.access

import com.vendorconnect.domain.shared.AuditInfo
import com.vendorconnect.domain.shared.Money
import java.time.LocalDate
import java.util.UUID

/**
 * Grants one user one role within a scope, with optional limits.
 * A user may hold several assignments; each request runs under exactly one of them.
 */
data class RoleAssignment(
    val id: UUID = UUID.randomUUID(),
    val userId: UUID,
    val roleId: UUID,
    val organizationId: UUID? = null,
    val projectId: UUID? = null,
    val scopeType: ScopeType = ScopeType.ALL,
    /** Discipline keys, or package/section ids, depending on [scopeType]. Empty for [ScopeType.ALL]. */
    val scopeRefs: Set<String> = emptySet(),
    val accessLevel: AccessLevel = AccessLevel.FULL,
    val approvalLimit: Money? = null,
    val reviewerUserId: UUID? = null,
    val validFrom: LocalDate = LocalDate.now(),
    val validUntil: LocalDate? = null,
    val status: AssignmentStatus = AssignmentStatus.ACTIVE,
    val source: AssignmentSource = AssignmentSource.MANUAL,
    val createdBy: UUID? = null,
    val audit: AuditInfo = AuditInfo()
) {
    /** Expiry is evaluated on read, so an assignment stops working on its end date without a job running. */
    fun isUsableOn(date: LocalDate): Boolean =
        status == AssignmentStatus.ACTIVE && !date.isBefore(validFrom) && (validUntil == null || !date.isAfter(validUntil))

    fun scope(): Scope = when (scopeType) {
        ScopeType.ALL -> Scope.All
        ScopeType.DISCIPLINE -> Scope.Disciplines(scopeRefs)
        ScopeType.PACKAGE -> Scope.Packages(scopeRefs.mapTo(mutableSetOf(), UUID::fromString))
        ScopeType.SECTION -> Scope.Sections(scopeRefs.mapTo(mutableSetOf(), UUID::fromString))
    }
}

enum class ScopeType { ALL, DISCIPLINE, PACKAGE, SECTION }

enum class AccessLevel(val allowedKinds: Set<PermissionKind>) {
    READ(setOf(PermissionKind.READ)),
    COMMENT(setOf(PermissionKind.READ)),
    EDIT(setOf(PermissionKind.READ, PermissionKind.WRITE)),
    FULL(setOf(PermissionKind.READ, PermissionKind.WRITE, PermissionKind.DECIDE))
}

enum class AssignmentStatus { ACTIVE, SUSPENDED, REVOKED }

/** [LEGACY_ROLE] assignments mirror `users.role` and are replaced whenever that column changes. */
enum class AssignmentSource { MANUAL, LEGACY_ROLE }
