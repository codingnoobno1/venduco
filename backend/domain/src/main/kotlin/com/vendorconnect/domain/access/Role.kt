package com.vendorconnect.domain.access

import com.vendorconnect.domain.shared.AuditInfo
import java.util.UUID

/**
 * A named bundle of permissions. Roles are data: system roles are seeded from [SystemRoles],
 * custom roles are created by an administrator. What a role may be applied to is fixed by [scopeLevel].
 */
data class Role(
    val id: UUID = UUID.randomUUID(),
    val key: String,
    val name: String,
    val description: String? = null,
    val portal: Portal,
    val scopeLevel: ScopeLevel,
    val isSystem: Boolean = false,
    val organizationId: UUID? = null,
    val defaultDashboardKey: String? = null,
    val isActive: Boolean = true,
    val permissions: Set<String> = emptySet(),
    val audit: AuditInfo = AuditInfo()
)

enum class Portal { BUYER, PARTNER, ADMIN }

/** The level a role is assigned at; it decides which scope fields an assignment must carry. */
enum class ScopeLevel { PLATFORM, ORGANIZATION, PROJECT, DISCIPLINE, PACKAGE, SECTION }
