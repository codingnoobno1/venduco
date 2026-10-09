package com.vendorconnect.web.controller

import com.vendorconnect.application.port.outbound.AuditLogPort
import com.vendorconnect.application.port.outbound.ContinuityGapView
import com.vendorconnect.application.port.outbound.CorridorSegmentView
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.ProjectSectionView
import com.vendorconnect.application.port.outbound.ProjectWorkPackageView
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AssignmentAdminUseCase
import com.vendorconnect.application.usecase.project.ProjectStructureUseCase
import com.vendorconnect.application.usecase.project.ProjectUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.project.PackageStatus
import com.vendorconnect.domain.project.Project
import com.vendorconnect.domain.project.ProjectStatus
import com.vendorconnect.domain.user.User
import com.vendorconnect.security.RequirePermission
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Projects as the dashboards read them. Every figure comes from stored records; where something is not
 * tracked yet (schedule dates, planned progress) the field is null rather than invented.
 * Each caller sees only the projects their assignment reaches.
 */
@RestController
@RequestMapping("/api/v1/projects")
class ProjectController(
    private val projects: ProjectUseCase,
    private val structure: ProjectStructureUseCase,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserRepositoryPort,
    private val assignments: AssignmentAdminUseCase,
    private val auditLog: AuditLogPort
) {

    data class ProjectResponse(
        /** The id again under the name the older pages read. */
        val _id: String,
        val id: String,
        val name: String,
        val projectCode: String,
        val corridor: String,
        val location: String,
        val clientName: String?,
        val organizationId: String,
        val pmName: String?,
        val projectHeadId: String,
        val budget: Double,
        val currency: String,
        /** Share of package value whose package is completed, 0–100. Null when no packages have a value. */
        val progress: Int?,
        /** Not tracked yet. */
        val plannedProgress: Int?,
        val riskLevel: String,
        val status: String,
        val imageUrl: String?,
        val projectType: String,
        val startDate: String?,
        val deadline: String?,
        val description: String?,
        val sectionCount: Int,
        val packageCount: Int,
        val delayedPackageCount: Int,
        val activities: List<ActivityResponse>,
        val departments: List<DepartmentResponse>
    )

    data class ActivityResponse(val id: String, val action: String, val type: String, val message: String, val timestamp: String, val userName: String)

    /** The older pages group work packages by "department"; here that is the corridor section a package sits in. */
    data class DepartmentResponse(val name: String, val isSelected: Boolean, val workPackages: List<WorkPackageResponse>)

    data class WorkPackageResponse(val id: String, val title: String, val code: String, val status: String, val contractorName: String?, val value: Long) {
        /** The names the older pages read. */
        val name: String get() = "$code · $title"
        val budget: Long get() = value
    }

    data class MemberResponse(
        val _id: String,
        val userId: String,
        val name: String,
        val email: String,
        val role: String,
        val roleKey: String,
        val accessLevel: String,
        val active: Boolean
    )

    @GetMapping
    @RequirePermission(Permissions.PROJECT_READ)
    fun list(ctx: AccessContext): List<ProjectResponse> = respond(projects.visibleTo(ctx))

    @GetMapping("/my")
    @RequirePermission(Permissions.PROJECT_READ)
    fun listMyProjects(ctx: AccessContext): List<ProjectResponse> = respond(projects.visibleTo(ctx))

    /** Projects the caller works on; the same set as /my, under the name the supervisor pages use. */
    @GetMapping("/assigned")
    @RequirePermission(Permissions.PROJECT_READ)
    fun assigned(ctx: AccessContext): List<ProjectResponse> = respond(projects.visibleTo(ctx))

    @GetMapping("/{id}")
    @RequirePermission(Permissions.PROJECT_READ)
    fun getById(@PathVariable id: UUID, ctx: AccessContext): ProjectResponse =
        respond(listOf(projects.getVisible(ctx, id)), withActivity = true).single()

    @GetMapping("/{id}/sections")
    @RequirePermission(Permissions.SECTION_READ)
    fun sections(@PathVariable id: UUID, ctx: AccessContext): List<ProjectSectionView> =
        structure.sections(projects.getVisible(ctx, id).id)

    @GetMapping("/{id}/work-packages")
    @RequirePermission(Permissions.PACKAGE_READ)
    fun workPackages(@PathVariable id: UUID, ctx: AccessContext): List<ProjectWorkPackageView> =
        structure.workPackages(projects.getVisible(ctx, id).id)

    @GetMapping("/{id}/corridor")
    @RequirePermission(Permissions.SECTION_READ)
    fun corridor(@PathVariable id: UUID, ctx: AccessContext): List<CorridorSegmentView> =
        structure.corridor(projects.getVisible(ctx, id).id)

    @GetMapping("/{id}/continuity-gaps")
    @RequirePermission(Permissions.SECTION_READ)
    fun continuityGaps(@PathVariable id: UUID, ctx: AccessContext): List<ContinuityGapView> =
        structure.continuityGaps(projects.getVisible(ctx, id).id)

    /** Everyone with an assignment on the project. Suspended and expired assignments are listed as inactive. */
    @GetMapping("/{id}/members")
    @RequirePermission(Permissions.TEAM_READ)
    fun members(@PathVariable id: UUID, ctx: AccessContext): List<MemberResponse> {
        val project = projects.getVisible(ctx, id)
        val people = users.findAll().associateBy { it.id }
        return assignments.list(null, null, project.id)
            .filter { it.assignment.status.name != "REVOKED" }
            .mapNotNull { view ->
                people[view.assignment.userId]?.let { user ->
                    MemberResponse(
                        _id = view.assignment.id.toString(),
                        userId = user.id.toString(),
                        name = user.fullName,
                        email = user.email,
                        role = view.role.name,
                        roleKey = view.role.key,
                        accessLevel = view.assignment.accessLevel.name,
                        active = view.usable && user.isActive
                    )
                }
            }
            .sortedBy { it.name.lowercase() }
    }

    private fun respond(found: List<Project>, withActivity: Boolean = false): List<ProjectResponse> {
        if (found.isEmpty()) return emptyList()
        val companies = organizations.findAll().associate { it.id to it.name }
        val people = users.findAll().associateBy { it.id }
        return found.sortedBy { it.name.lowercase() }.map { project ->
            val sections = structure.sections(project.id)
            val packages = structure.workPackages(project.id)
            val packageValue = packages.sumOf { it.plannedValue }
            val completedValue = packages.filter { it.status == PackageStatus.COMPLETED.name }.sumOf { it.plannedValue }
            val delayed = packages.count { it.status == PackageStatus.DELAYED.name }
            ProjectResponse(
                _id = project.id.toString(),
                id = project.id.toString(),
                name = project.name,
                projectCode = project.corridorName.filter { it.isLetterOrDigit() }.take(8).uppercase().ifEmpty { project.id.toString().take(8) },
                corridor = project.corridorName,
                location = project.corridorName,
                clientName = companies[project.organizationId],
                organizationId = project.organizationId.toString(),
                pmName = people[project.projectHeadId]?.fullName,
                projectHeadId = project.projectHeadId.toString(),
                budget = project.estimatedBudget.amount.toDouble(),
                currency = project.estimatedBudget.currency.currencyCode,
                progress = when {
                    project.status == ProjectStatus.COMPLETED -> 100
                    packageValue > 0 -> (completedValue * 100 / packageValue).toInt()
                    else -> null
                },
                plannedProgress = null,
                riskLevel = when {
                    project.status == ProjectStatus.ON_HOLD || delayed >= 2 -> "HIGH"
                    delayed == 1 -> "MEDIUM"
                    else -> "LOW"
                },
                status = project.status.name,
                imageUrl = project.imageUrl,
                projectType = "Infrastructure",
                startDate = null,
                deadline = null,
                description = null,
                sectionCount = sections.size,
                packageCount = packages.size,
                delayedPackageCount = delayed,
                activities = if (withActivity) activities(project, people) else emptyList(),
                departments = sections.map { section ->
                    DepartmentResponse(
                        name = "${section.sectionCode} · ${section.name}",
                        isSelected = true,
                        workPackages = packages.filter { it.sectionCode == section.sectionCode }.map {
                            WorkPackageResponse(it.id, it.workScope, it.packageCode, it.status, it.contractorName, it.plannedValue)
                        }
                    )
                }
            )
        }
    }

    /** The project's recorded changes, newest first. */
    private fun activities(project: Project, people: Map<UUID, User>): List<ActivityResponse> =
        auditLog.findRecent("PROJECT", project.id.toString(), null, ACTIVITY_LIMIT).map {
            ActivityResponse(
                id = it.id.toString(),
                action = it.action,
                type = if (it.action.startsWith("PACKAGE") || it.action.startsWith("SECTION")) "MILESTONE" else "UPDATE",
                message = it.summary,
                timestamp = it.occurredAt.toString(),
                userName = it.actorUserId?.let { id -> people[id]?.fullName } ?: "System"
            )
        }

    private companion object {
        const val ACTIVITY_LIMIT = 20
    }
}
