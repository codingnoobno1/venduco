package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.access.Role
import java.util.UUID

interface RoleRepositoryPort {
    fun save(role: Role): Role
    fun findById(id: UUID): Role?
    fun findByKey(key: String): Role?
    fun findAllById(ids: Collection<UUID>): List<Role>
    fun findAll(): List<Role>
    fun deleteById(id: UUID)
}
