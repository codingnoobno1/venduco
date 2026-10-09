package com.vendorconnect.application.port.outbound

import java.util.UUID

data class ProjectSectionView(
    val id: String,
    val sectionCode: String,
    val chainageRange: String,
    val lengthKm: Double,
    val name: String,
    val contractorName: String?,
    val plannedValue: Long,
    val actualValue: Long,
    val status: String,
    val progress: Int
)

data class ProjectWorkPackageView(
    val id: String,
    val packageCode: String,
    val sectionCode: String,
    val chainageRange: String,
    val lengthKm: Double,
    val workScope: String,
    val contractorName: String?,
    val plannedValue: Long,
    val actualValue: Long,
    val status: String,
    val progress: Int
)

data class CorridorSegmentView(
    val id: String,
    val name: String,
    val chainage: String,
    val stage: String,
    val length: Double,
    val status: String,
    val progress: Int,
    val ownerName: String?
)

data class ContinuityGapView(
    val id: String,
    val chainage: String,
    val length: Double,
    val issue: String,
    val impact: String,
    val ownerName: String?,
    val status: String,
    val resolutionPlan: String
)

interface ProjectStructureQueryPort {
    fun sections(projectId: UUID): List<ProjectSectionView>
    fun workPackages(projectId: UUID): List<ProjectWorkPackageView>
    fun corridor(projectId: UUID): List<CorridorSegmentView>
    fun continuityGaps(projectId: UUID): List<ContinuityGapView>
}
