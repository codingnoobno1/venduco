package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.project.PackageStatus
import com.vendorconnect.domain.shared.Money
import java.util.UUID

data class NewSection(
    val name: String,
    val startLatitude: Double,
    val startLongitude: Double,
    val startLabel: String?,
    val endLatitude: Double,
    val endLongitude: Double,
    val endLabel: String?,
    val lengthKm: Double
)

data class NewPackage(
    val packageNumber: String,
    val description: String,
    val contractorId: UUID?,
    val status: PackageStatus,
    val estimatedValue: Money
)

/** A work package as stored, with the project it belongs to (through its section). */
data class StoredPackage(
    val id: UUID,
    val projectId: UUID,
    val sectionId: UUID,
    val packageNumber: String,
    val description: String,
    val contractorId: UUID?,
    val status: PackageStatus,
    val estimatedValue: Money
)

/** Writes to a project's sections and work packages. Reads stay on [ProjectStructureQueryPort]. */
interface ProjectStructureCommandPort {
    fun addSection(projectId: UUID, section: NewSection): UUID
    /** The project a section belongs to, or null when there is no such section. */
    fun projectOfSection(sectionId: UUID): UUID?
    fun packageNumberTaken(projectId: UUID, packageNumber: String, exceptPackageId: UUID? = null): Boolean
    fun addPackage(sectionId: UUID, pkg: NewPackage): UUID
    fun findPackage(packageId: UUID): StoredPackage?
    fun updatePackage(packageId: UUID, status: PackageStatus, contractorId: UUID?, estimatedValue: Money)
}
