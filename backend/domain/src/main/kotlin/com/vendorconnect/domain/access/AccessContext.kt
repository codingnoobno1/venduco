package com.vendorconnect.domain.access

import com.vendorconnect.domain.shared.InsufficientPermissionException
import com.vendorconnect.domain.shared.Money
import java.util.UUID

/**
 * Who is calling and under which assignment. Built once per request and handed to use cases,
 * which use [permissions] for "may they do this" and [scope] for "on which records".
 */
data class AccessContext(
    val userId: UUID,
    val assignmentId: UUID,
    val roleId: UUID,
    val roleKey: String,
    val organizationId: UUID?,
    val projectId: UUID?,
    /** Already capped by the assignment's access level. */
    val permissions: Set<String>,
    val scope: Scope,
    val accessLevel: AccessLevel,
    val approvalLimit: Money?,
    val reviewerUserId: UUID?
) {
    fun has(permission: String): Boolean = permission in permissions

    fun require(permission: String) {
        if (!has(permission)) throw InsufficientPermissionException(permission)
    }
}

sealed interface Scope {
    data object All : Scope
    data class Disciplines(val keys: Set<String>) : Scope
    data class Packages(val ids: Set<UUID>) : Scope
    data class Sections(val ids: Set<UUID>) : Scope
}
