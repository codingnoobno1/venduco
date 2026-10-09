package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.access.RoleAssignment
import java.util.UUID

interface RoleAssignmentRepositoryPort {
    fun save(assignment: RoleAssignment): RoleAssignment
    fun findById(id: UUID): RoleAssignment?

    /** Oldest first, so the first usable entry is a stable default. */
    fun findByUserId(userId: UUID): List<RoleAssignment>
    fun findByRoleId(roleId: UUID): List<RoleAssignment>
    fun findAll(): List<RoleAssignment>
    fun existsByUserId(userId: UUID): Boolean
}
