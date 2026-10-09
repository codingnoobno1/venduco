package com.vendorconnect.web.controller

import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Role
import com.vendorconnect.domain.access.RoleAssignment
import com.vendorconnect.domain.shared.Money
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Pattern
import java.util.Currency

/** Money on the wire: integer minor units (paise) plus ISO currency code. */
data class MoneyDto(
    @field:Min(0) val amountMinor: Long,
    @field:Pattern(regexp = "^[A-Z]{3}$") val currency: String = "INR"
) {
    fun toDomain(): Money {
        val unit = runCatching { Currency.getInstance(currency) }.getOrElse { throw DomainException("Unknown currency '$currency'") }
        return Money.ofMinorUnits(amountMinor, unit)
    }
}

fun Money.toDto() = MoneyDto(toMinorUnits(), currency.currencyCode)

data class RoleSummary(val id: String, val key: String, val name: String, val portal: String, val scopeLevel: String)

fun Role.toSummary() = RoleSummary(id.toString(), key, name, portal.name, scopeLevel.name)

data class RoleResponse(
    val id: String,
    val key: String,
    val name: String,
    val description: String?,
    val portal: String,
    val scopeLevel: String,
    val system: Boolean,
    val active: Boolean,
    val defaultDashboardKey: String?,
    val permissions: List<String>
)

fun Role.toResponse() = RoleResponse(
    id = id.toString(),
    key = key,
    name = name,
    description = description,
    portal = portal.name,
    scopeLevel = scopeLevel.name,
    system = isSystem,
    active = isActive,
    defaultDashboardKey = defaultDashboardKey,
    permissions = permissions.sorted()
)

data class AssignmentResponse(
    val id: String,
    val userId: String,
    val role: RoleSummary,
    val organizationId: String?,
    val projectId: String?,
    val scopeType: String,
    val scopeRefs: List<String>,
    val accessLevel: String,
    val approvalLimit: MoneyDto?,
    val reviewerUserId: String?,
    val validFrom: String,
    val validUntil: String?,
    val status: String,
    val source: String,
    /** False when suspended, outside its validity dates, or its role is inactive. */
    val usable: Boolean
)

fun RoleAssignment.toResponse(role: Role, usable: Boolean) = AssignmentResponse(
    id = id.toString(),
    userId = userId.toString(),
    role = role.toSummary(),
    organizationId = organizationId?.toString(),
    projectId = projectId?.toString(),
    scopeType = scopeType.name,
    scopeRefs = scopeRefs.sorted(),
    accessLevel = accessLevel.name,
    approvalLimit = approvalLimit?.toDto(),
    reviewerUserId = reviewerUserId?.toString(),
    validFrom = validFrom.toString(),
    validUntil = validUntil?.toString(),
    status = status.name,
    source = source.name,
    usable = usable
)

/** What the server will allow under one assignment. */
data class EffectiveAccessResponse(
    val assignmentId: String,
    val role: RoleSummary,
    val organizationId: String?,
    val projectId: String?,
    val scopeType: String,
    val scopeRefs: List<String>,
    val accessLevel: String,
    val approvalLimit: MoneyDto?,
    val reviewerUserId: String?,
    val defaultDashboardKey: String?,
    val permissions: List<String>
)

fun AccessContext.toResponse(role: Role, assignment: RoleAssignment) = EffectiveAccessResponse(
    assignmentId = assignmentId.toString(),
    role = role.toSummary(),
    organizationId = organizationId?.toString(),
    projectId = projectId?.toString(),
    scopeType = assignment.scopeType.name,
    scopeRefs = assignment.scopeRefs.sorted(),
    accessLevel = accessLevel.name,
    approvalLimit = approvalLimit?.toDto(),
    reviewerUserId = reviewerUserId?.toString(),
    defaultDashboardKey = role.defaultDashboardKey,
    permissions = permissions.sorted()
)
