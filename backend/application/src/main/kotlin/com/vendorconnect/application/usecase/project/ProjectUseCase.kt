package com.vendorconnect.application.usecase.project

import com.vendorconnect.application.port.outbound.ProjectRepositoryPort
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.project.Project
import com.vendorconnect.domain.shared.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

// RECOVERED from a 6 Oct listing of the file.
@Service
@Transactional(readOnly = true)
class ProjectUseCase(
    private val projectRepositoryPort: ProjectRepositoryPort
) {
    fun listAll(): List<Project> {
        return projectRepositoryPort.findAll()
    }

    fun getById(id: UUID): Project {
        // An unknown id is the caller's mistake (404), not a server fault.
        return projectRepositoryPort.findById(id) ?: throw EntityNotFoundException("Project", id)
    }

    /**
     * The projects an assignment reaches: one project for a project-scoped assignment, the company's projects
     * for a company-scoped one (plus any it heads), and every project for a platform-wide one with portfolio access.
     */
    fun visibleTo(ctx: AccessContext): List<Project> = listAll().filter { canSee(ctx, it) }

    /** A project outside the caller's reach is reported as not found, so its existence is not disclosed. */
    fun getVisible(ctx: AccessContext, id: UUID): Project =
        getById(id).takeIf { canSee(ctx, it) } ?: throw EntityNotFoundException("Project", id)

    private fun canSee(ctx: AccessContext, project: Project): Boolean = when {
        ctx.projectId != null -> project.id == ctx.projectId
        ctx.organizationId != null -> project.organizationId == ctx.organizationId || project.projectHeadId == ctx.userId
        // Neither a project nor a company: platform-wide only with portfolio access, otherwise just what they head.
        ctx.has(Permissions.PORTFOLIO_READ) -> true
        else -> project.projectHeadId == ctx.userId
    }

    @Transactional
    fun create(project: Project): Project {
        return projectRepositoryPort.save(project)
    }
}
