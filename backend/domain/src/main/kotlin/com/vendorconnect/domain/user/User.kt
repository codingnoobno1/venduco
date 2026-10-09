package com.vendorconnect.domain.user

import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.shared.AuditInfo
import java.util.UUID

/**
 * User aggregate root.
 * Pure domain model — NO JPA annotations here.
 * JPA entities live in the infrastructure layer.
 */
data class User(
    val id: UUID = UUID.randomUUID(),
    val email: String,
    val fullName: String,
    val passwordHash: String,
    val role: UserRole,
    val organizationId: UUID? = null,
    val isActive: Boolean = true,
    val approvalStatus: ApprovalStatus = ApprovalStatus.APPROVED,
    val approvalNote: String? = null,
    val audit: AuditInfo = AuditInfo()
) {
    fun hasPermission(permission: Permission): Boolean {
        return role.permissions.contains(permission)
    }

    fun isAdmin(): Boolean = role == UserRole.ADMIN
    fun isProjectHead(): Boolean = role == UserRole.PROJECT_HEAD

    // Keeps the password hash out of logs and exception messages.
    override fun toString(): String =
        "User(id=$id, email=$email, fullName=$fullName, role=$role, organizationId=$organizationId, isActive=$isActive)"
}
