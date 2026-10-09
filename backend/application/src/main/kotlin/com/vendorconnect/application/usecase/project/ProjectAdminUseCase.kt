package com.vendorconnect.application.usecase.project

import com.vendorconnect.application.port.outbound.NewPackage
import com.vendorconnect.application.port.outbound.NewSection
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.ProjectRepositoryPort
import com.vendorconnect.application.port.outbound.ProjectStructureCommandPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.project.PackageStatus
import com.vendorconnect.domain.project.Project
import com.vendorconnect.domain.project.ProjectStatus
import com.vendorconnect.domain.shared.ConflictException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.domain.shared.requireDomain
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Creating and changing projects and their structure (sections, work packages).
 * Each change is checked against the caller's permissions and written to the audit log in the same transaction.
 */
@Service
@Transactional
class ProjectAdminUseCase(
    private val projects: ProjectRepositoryPort,
    private val structure: ProjectStructureCommandPort,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserRepositoryPort,
    private val audit: AuditRecorder
) {

    data class ProjectCommand(
        val name: String,
        val corridorName: String,
        val organizationId: UUID,
        val projectHeadId: UUID,
        val estimatedBudget: Money,
        val status: ProjectStatus = ProjectStatus.PLANNING
    )

    fun create(ctx: AccessContext, command: ProjectCommand): Project {
        ctx.require(Permissions.PROJECT_CREATE)
        val checked = validated(command)
        val project = projects.save(
            Project(
                name = checked.name,
                corridorName = checked.corridorName,
                organizationId = checked.organizationId,
                projectHeadId = checked.projectHeadId,
                status = checked.status,
                estimatedBudget = checked.estimatedBudget
            )
        )
        audit.record(ctx, "PROJECT_CREATED", ENTITY, project.id, "Created project ${project.name} (${project.corridorName})")
        return project
    }

    fun update(ctx: AccessContext, id: UUID, command: ProjectCommand): Project {
        ctx.require(Permissions.PROJECT_UPDATE)
        val before = projects.findById(id) ?: throw EntityNotFoundException("Project", id)
        val checked = validated(command)
        val after = projects.save(
            before.copy(
                name = checked.name,
                corridorName = checked.corridorName,
                organizationId = checked.organizationId,
                projectHeadId = checked.projectHeadId,
                status = checked.status,
                estimatedBudget = checked.estimatedBudget
            )
        )
        val changes = buildList {
            if (before.name != after.name) add("name '${before.name}' → '${after.name}'")
            if (before.corridorName != after.corridorName) add("corridor '${before.corridorName}' → '${after.corridorName}'")
            if (before.organizationId != after.organizationId) add("owning company changed")
            if (before.projectHeadId != after.projectHeadId) add("project head changed")
            if (before.status != after.status) add("status ${before.status} → ${after.status}")
            if (before.estimatedBudget != after.estimatedBudget) add("budget ${before.estimatedBudget.formatted()} → ${after.estimatedBudget.formatted()}")
        }
        if (changes.isNotEmpty()) {
            audit.record(ctx, "PROJECT_UPDATED", ENTITY, id, "${after.name}: ${changes.joinToString("; ")}")
        }
        return after
    }

    fun addSection(ctx: AccessContext, projectId: UUID, section: NewSection): UUID {
        ctx.require(Permissions.SECTION_UPDATE)
        val project = projects.findById(projectId) ?: throw EntityNotFoundException("Project", projectId)
        val name = section.name.trim()
        requireDomain(name.length in 2..160) { "Section name must be 2 to 160 characters." }
        requireDomain(section.lengthKm >= 0 && section.lengthKm <= MAX_SECTION_KM) { "Length must be between 0 and $MAX_SECTION_KM km." }
        requireCoordinate(section.startLatitude, section.startLongitude, "Start")
        requireCoordinate(section.endLatitude, section.endLongitude, "End")
        val id = structure.addSection(
            projectId,
            section.copy(name = name, startLabel = section.startLabel?.trim()?.ifEmpty { null }, endLabel = section.endLabel?.trim()?.ifEmpty { null })
        )
        audit.record(ctx, "SECTION_ADDED", ENTITY, projectId, "${project.name}: added section $name (${section.lengthKm} km)")
        return id
    }

    fun addPackage(ctx: AccessContext, sectionId: UUID, pkg: NewPackage): UUID {
        ctx.require(Permissions.PACKAGE_UPDATE)
        val projectId = structure.projectOfSection(sectionId) ?: throw EntityNotFoundException("Section", sectionId)
        val number = pkg.packageNumber.trim().uppercase()
        val description = pkg.description.trim()
        requireDomain(PACKAGE_NUMBER.matches(number)) { "Package number must be 2 to 20 letters, digits or dashes, for example CIV-04." }
        requireDomain(description.length in 2..300) { "Package description must be 2 to 300 characters." }
        if (structure.packageNumberTaken(projectId, number)) throw ConflictException("Package $number already exists on this project.")
        pkg.contractorId?.let { requireCompany(it) }
        val id = structure.addPackage(sectionId, pkg.copy(packageNumber = number, description = description))
        audit.record(ctx, "PACKAGE_ADDED", ENTITY, projectId, "Added package $number: $description (${pkg.estimatedValue.formatted()})")
        return id
    }

    fun updatePackage(ctx: AccessContext, packageId: UUID, status: PackageStatus, contractorId: UUID?, estimatedValue: Money) {
        ctx.require(Permissions.PACKAGE_UPDATE)
        val before = structure.findPackage(packageId) ?: throw EntityNotFoundException("Package", packageId)
        contractorId?.let { requireCompany(it) }
        structure.updatePackage(packageId, status, contractorId, estimatedValue)
        val changes = buildList {
            if (before.status != status) add("status ${before.status} → $status")
            if (before.contractorId != contractorId) add(if (contractorId == null) "contractor removed" else "contractor changed")
            if (before.estimatedValue != estimatedValue) add("value ${before.estimatedValue.formatted()} → ${estimatedValue.formatted()}")
        }
        if (changes.isNotEmpty()) {
            audit.record(ctx, "PACKAGE_UPDATED", ENTITY, before.projectId, "Package ${before.packageNumber}: ${changes.joinToString("; ")}")
        }
    }

    private fun validated(command: ProjectCommand): ProjectCommand {
        val name = command.name.trim()
        val corridor = command.corridorName.trim()
        requireDomain(name.length in 2..160) { "Project name must be 2 to 160 characters." }
        requireDomain(corridor.length in 2..160) { "Corridor name must be 2 to 160 characters." }
        requireCompany(command.organizationId)
        val head = users.findById(command.projectHeadId) ?: throw EntityNotFoundException("User", command.projectHeadId)
        requireDomain(head.isActive) { "${head.fullName} is deactivated and cannot head a project." }
        return command.copy(name = name, corridorName = corridor)
    }

    private fun requireCompany(id: UUID) {
        organizations.findById(id) ?: throw EntityNotFoundException("Company", id)
    }

    private fun requireCoordinate(latitude: Double, longitude: Double, which: String) {
        requireDomain(latitude in -90.0..90.0 && longitude in -180.0..180.0) { "$which coordinates are out of range." }
    }

    private companion object {
        const val ENTITY = "PROJECT"
        const val MAX_SECTION_KM = 5000.0
        val PACKAGE_NUMBER = Regex("^[A-Z0-9][A-Z0-9-]{1,19}$")
    }
}
