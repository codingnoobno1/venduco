package com.vendorconnect.domain.project

import com.vendorconnect.domain.shared.AuditInfo
import com.vendorconnect.domain.shared.Location
import com.vendorconnect.domain.shared.Money
import java.util.UUID

/**
 * Project aggregate root.
 * Represents an infrastructure corridor project (e.g., Eastern Freight Corridor).
 */
data class Project(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val corridorName: String,
    val organizationId: UUID,
    val projectHeadId: UUID,
    val status: ProjectStatus = ProjectStatus.PLANNING,
    val estimatedBudget: Money,
    val imageUrl: String? = null,
    val sections: List<Section> = emptyList(),
    val audit: AuditInfo = AuditInfo()
)

enum class ProjectStatus {
    PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
}

/**
 * A section of a corridor (e.g., Kolkata → Khurja).
 */
data class Section(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val startLocation: Location,
    val endLocation: Location,
    val lengthKm: Double,
    val packages: List<CorridorPackage> = emptyList()
)

/**
 * An EPC package within a corridor section.
 */
data class CorridorPackage(
    val id: UUID = UUID.randomUUID(),
    val packageNumber: String,
    val description: String,
    val contractorId: UUID? = null,
    val status: PackageStatus = PackageStatus.NOT_STARTED,
    val estimatedValue: Money
)

enum class PackageStatus {
    NOT_STARTED, MOBILIZATION, IN_PROGRESS, COMPLETED, DELAYED
}
