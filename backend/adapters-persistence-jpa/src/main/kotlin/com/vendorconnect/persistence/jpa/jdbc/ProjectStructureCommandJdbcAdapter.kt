package com.vendorconnect.persistence.jpa.jdbc

import com.vendorconnect.application.port.outbound.NewPackage
import com.vendorconnect.application.port.outbound.NewSection
import com.vendorconnect.application.port.outbound.ProjectStructureCommandPort
import com.vendorconnect.application.port.outbound.StoredPackage
import com.vendorconnect.domain.project.PackageStatus
import com.vendorconnect.domain.shared.Money
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.util.Currency
import java.util.UUID

@Component
class ProjectStructureCommandJdbcAdapter(private val jdbc: JdbcTemplate) : ProjectStructureCommandPort {

    override fun addSection(projectId: UUID, section: NewSection): UUID {
        val id = UUID.randomUUID()
        jdbc.update(
            """INSERT INTO project_sections (id, project_id, name, start_latitude, start_longitude, start_label,
                                             end_latitude, end_longitude, end_label, length_km)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            id.toString(), projectId.toString(), section.name, section.startLatitude, section.startLongitude, section.startLabel,
            section.endLatitude, section.endLongitude, section.endLabel, section.lengthKm
        )
        return id
    }

    override fun projectOfSection(sectionId: UUID): UUID? =
        jdbc.query("SELECT project_id FROM project_sections WHERE id = ?", { rs, _ -> UUID.fromString(rs.getString(1)) }, sectionId.toString())
            .firstOrNull()

    override fun packageNumberTaken(projectId: UUID, packageNumber: String, exceptPackageId: UUID?): Boolean =
        jdbc.queryForObject(
            """SELECT COUNT(*) FROM corridor_packages p JOIN project_sections s ON s.id = p.section_id
                WHERE s.project_id = ? AND upper(p.package_number) = upper(?) AND p.id <> ?""",
            Int::class.java, projectId.toString(), packageNumber, exceptPackageId?.toString().orEmpty()
        )!! > 0

    override fun addPackage(sectionId: UUID, pkg: NewPackage): UUID {
        val id = UUID.randomUUID()
        jdbc.update(
            """INSERT INTO corridor_packages (id, section_id, package_number, description, contractor_id, status,
                                              estimated_value_minor, estimated_value_currency)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            id.toString(), sectionId.toString(), pkg.packageNumber, pkg.description, pkg.contractorId?.toString(), pkg.status.name,
            pkg.estimatedValue.toMinorUnits(), pkg.estimatedValue.currency.currencyCode
        )
        return id
    }

    override fun findPackage(packageId: UUID): StoredPackage? = jdbc.query(
        """SELECT p.id, s.project_id, p.section_id, p.package_number, p.description, p.contractor_id, p.status,
                  p.estimated_value_minor, p.estimated_value_currency
             FROM corridor_packages p JOIN project_sections s ON s.id = p.section_id
            WHERE p.id = ?""",
        { rs, _ ->
            val currency = Currency.getInstance(rs.getString("estimated_value_currency"))
            StoredPackage(
                id = UUID.fromString(rs.getString("id")),
                projectId = UUID.fromString(rs.getString("project_id")),
                sectionId = UUID.fromString(rs.getString("section_id")),
                packageNumber = rs.getString("package_number"),
                description = rs.getString("description"),
                contractorId = rs.getString("contractor_id")?.let(UUID::fromString),
                status = PackageStatus.valueOf(rs.getString("status")),
                estimatedValue = Money(BigDecimal.valueOf(rs.getLong("estimated_value_minor"), currency.defaultFractionDigits), currency)
            )
        },
        packageId.toString()
    ).firstOrNull()

    override fun updatePackage(packageId: UUID, status: PackageStatus, contractorId: UUID?, estimatedValue: Money) {
        jdbc.update(
            """UPDATE corridor_packages SET status = ?, contractor_id = ?, estimated_value_minor = ?, estimated_value_currency = ?
                WHERE id = ?""",
            status.name, contractorId?.toString(), estimatedValue.toMinorUnits(), estimatedValue.currency.currencyCode, packageId.toString()
        )
    }
}
