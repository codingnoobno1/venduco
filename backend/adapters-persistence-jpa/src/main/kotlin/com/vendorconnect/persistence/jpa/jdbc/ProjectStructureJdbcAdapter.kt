package com.vendorconnect.persistence.jpa.jdbc

import com.vendorconnect.application.port.outbound.*
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ProjectStructureJdbcAdapter(private val jdbc: JdbcTemplate) : ProjectStructureQueryPort {
    private data class SectionRow(
        val id: String,
        val name: String,
        val startLabel: String,
        val endLabel: String,
        val lengthKm: Double
    )

    private data class PackageRow(
        val id: String,
        val sectionId: String,
        val packageNumber: String,
        val description: String,
        val contractorName: String?,
        val status: String,
        val estimatedValueMinor: Long
    )

    override fun sections(projectId: UUID): List<ProjectSectionView> {
        val sections = loadSections(projectId)
        val packages = loadPackages(projectId).groupBy { it.sectionId }
        return sections.mapIndexed { index, section ->
            val sectionPackages = packages[section.id].orEmpty()
            val planned = sectionPackages.sumOf { it.estimatedValueMinor / 100 }
            val actual = sectionPackages.sumOf { actualValue(it) }
            val progress = if (planned == 0L) 0 else ((actual * 100) / planned).toInt().coerceIn(0, 100)
            ProjectSectionView(
                id = section.id,
                sectionCode = "SEC-${(index + 1).toString().padStart(2, '0')}",
                chainageRange = "${section.startLabel} – ${section.endLabel}",
                lengthKm = section.lengthKm,
                name = section.name,
                contractorName = sectionPackages.mapNotNull { it.contractorName }.distinct().joinToString().ifBlank { null },
                plannedValue = planned,
                actualValue = actual,
                status = sectionStatus(sectionPackages),
                progress = progress
            )
        }
    }

    override fun workPackages(projectId: UUID): List<ProjectWorkPackageView> {
        val sections = loadSections(projectId)
        val sectionById = sections.withIndex().associate { it.value.id to (it.index to it.value) }
        return loadPackages(projectId).map { pkg ->
            val (index, section) = requireNotNull(sectionById[pkg.sectionId])
            val planned = pkg.estimatedValueMinor / 100
            val progress = packageProgress(pkg.status)
            ProjectWorkPackageView(
                id = pkg.id,
                packageCode = pkg.packageNumber,
                sectionCode = "SEC-${(index + 1).toString().padStart(2, '0')}",
                chainageRange = "${section.startLabel} – ${section.endLabel}",
                lengthKm = section.lengthKm,
                workScope = pkg.description,
                contractorName = pkg.contractorName,
                plannedValue = planned,
                actualValue = planned * progress / 100,
                status = pkg.status,
                progress = progress
            )
        }
    }

    override fun corridor(projectId: UUID): List<CorridorSegmentView> {
        val stages = listOf("Earthwork", "Foundations", "Piers", "Deck", "Track")
        val packages = loadPackages(projectId).groupBy { it.sectionId }
        return loadSections(projectId).flatMap { section ->
            val sectionPackages = packages[section.id].orEmpty()
            val base = if (sectionPackages.isEmpty()) 0 else sectionPackages.map { packageProgress(it.status) }.average().toInt()
            stages.mapIndexed { stageIndex, stage ->
                val progress = (base - stageIndex * 9).coerceIn(0, 100)
                val atRisk = sectionPackages.any { it.status == "DELAYED" }
                CorridorSegmentView(
                    id = "${section.id}-${stage.lowercase()}",
                    name = section.name,
                    chainage = "${section.startLabel} – ${section.endLabel}",
                    stage = stage,
                    length = section.lengthKm,
                    status = when {
                        progress == 100 -> "COMPLETED"
                        atRisk -> "AT_RISK"
                        progress > 0 -> "IN_PROGRESS"
                        else -> "NOT_STARTED"
                    },
                    progress = progress,
                    ownerName = sectionPackages.mapNotNull { it.contractorName }.distinct().joinToString().ifBlank { null }
                )
            }
        }
    }

    override fun continuityGaps(projectId: UUID): List<ContinuityGapView> {
        val sections = loadSections(projectId).associateBy { it.id }
        return loadPackages(projectId).filter { it.status == "DELAYED" }.map { pkg ->
            val section = requireNotNull(sections[pkg.sectionId])
            ContinuityGapView(
                id = pkg.id,
                chainage = "${section.startLabel} – ${section.endLabel}",
                length = section.lengthKm,
                issue = "Delayed package: ${pkg.description}",
                impact = "Corridor continuity and downstream handover",
                ownerName = pkg.contractorName,
                status = "OPEN",
                resolutionPlan = "Recover the package programme and clear the blocked handover interface."
            )
        }
    }

    private fun loadSections(projectId: UUID): List<SectionRow> = jdbc.query(
        """SELECT id, name, COALESCE(start_label, printf('%.4f, %.4f', start_latitude, start_longitude)) AS start_label,
                  COALESCE(end_label, printf('%.4f, %.4f', end_latitude, end_longitude)) AS end_label, length_km
             FROM project_sections WHERE project_id = ? ORDER BY rowid""",
        { rs, _ -> SectionRow(rs.getString("id"), rs.getString("name"), rs.getString("start_label"), rs.getString("end_label"), rs.getDouble("length_km")) },
        projectId.toString()
    )

    private fun loadPackages(projectId: UUID): List<PackageRow> = jdbc.query(
        """SELECT p.id, p.section_id, p.package_number, p.description, o.name AS contractor_name,
                  p.status, p.estimated_value_minor
             FROM corridor_packages p
             JOIN project_sections s ON s.id = p.section_id
             LEFT JOIN organizations o ON o.id = p.contractor_id
            WHERE s.project_id = ? ORDER BY s.rowid, p.package_number""",
        { rs, _ -> PackageRow(rs.getString("id"), rs.getString("section_id"), rs.getString("package_number"),
            rs.getString("description"), rs.getString("contractor_name"), rs.getString("status"), rs.getLong("estimated_value_minor")) },
        projectId.toString()
    )

    private fun packageProgress(status: String): Int = when (status) {
        "COMPLETED" -> 100
        "IN_PROGRESS" -> 58
        "DELAYED" -> 42
        "MOBILIZATION" -> 12
        else -> 0
    }

    private fun actualValue(pkg: PackageRow): Long = (pkg.estimatedValueMinor / 100) * packageProgress(pkg.status) / 100

    private fun sectionStatus(packages: List<PackageRow>): String = when {
        packages.isEmpty() -> "NOT_STARTED"
        packages.any { it.status == "DELAYED" } -> "AT_RISK"
        packages.all { it.status == "COMPLETED" } -> "COMPLETED"
        packages.any { it.status == "IN_PROGRESS" || it.status == "MOBILIZATION" } -> "IN_PROGRESS"
        else -> "PLANNING"
    }
}
