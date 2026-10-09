package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.project.Project
import java.util.UUID

interface ProjectRepositoryPort {
    fun findAll(): List<Project>
    fun findById(id: UUID): Project?
    fun save(project: Project): Project
}
