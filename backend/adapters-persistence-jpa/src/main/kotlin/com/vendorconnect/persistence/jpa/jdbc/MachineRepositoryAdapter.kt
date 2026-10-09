package com.vendorconnect.persistence.jpa.jdbc

import com.vendorconnect.application.usecase.fleet.Machine
import com.vendorconnect.application.usecase.fleet.MachineRepositoryPort
import com.vendorconnect.application.usecase.fleet.MachineStatus
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Component
class MachineRepositoryAdapter(private val jdbc: JdbcTemplate) : MachineRepositoryPort {

    private val mapper = RowMapper { rs, _ ->
        Machine(
            id = UUID.fromString(rs.getString("id")),
            owner = SubjectRef(SubjectType.valueOf(rs.getString("owner_type")), UUID.fromString(rs.getString("owner_id"))),
            machineCode = rs.getString("machine_code"),
            name = rs.getString("name"),
            machineType = rs.getString("machine_type"),
            manufacturer = rs.getString("manufacturer"),
            model = rs.getString("model"),
            yearOfManufacture = rs.getInt("year_of_manufacture").let { if (rs.wasNull()) null else it },
            capacity = rs.getString("capacity"),
            location = rs.getString("location"),
            registrationNumber = rs.getString("registration_number"),
            insuranceExpiry = rs.getString("insurance_expiry")?.let(LocalDate::parse),
            lastMaintenanceDate = rs.getString("last_maintenance_date")?.let(LocalDate::parse),
            status = MachineStatus.valueOf(rs.getString("status")),
            createdAt = Instant.parse(rs.getString("created_at")),
            updatedAt = Instant.parse(rs.getString("updated_at"))
        )
    }

    override fun save(machine: Machine): Machine {
        val m = machine
        jdbc.update(
            """INSERT INTO machines (id, owner_type, owner_id, machine_code, name, machine_type, manufacturer, model, year_of_manufacture,
                   capacity, location, registration_number, insurance_expiry, last_maintenance_date, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET machine_code = excluded.machine_code, name = excluded.name, machine_type = excluded.machine_type,
                   manufacturer = excluded.manufacturer, model = excluded.model, year_of_manufacture = excluded.year_of_manufacture,
                   capacity = excluded.capacity, location = excluded.location, registration_number = excluded.registration_number,
                   insurance_expiry = excluded.insurance_expiry, last_maintenance_date = excluded.last_maintenance_date,
                   status = excluded.status, updated_at = excluded.updated_at""",
            m.id.toString(), m.owner.type.name, m.owner.id.toString(), m.machineCode, m.name, m.machineType, m.manufacturer, m.model,
            m.yearOfManufacture, m.capacity, m.location, m.registrationNumber, m.insuranceExpiry?.toString(),
            m.lastMaintenanceDate?.toString(), m.status.name, m.createdAt.toString(), m.updatedAt.toString()
        )
        return m
    }

    override fun findById(id: UUID): Machine? = jdbc.query("SELECT * FROM machines WHERE id = ?", mapper, id.toString()).firstOrNull()

    override fun findByOwner(owner: SubjectRef): List<Machine> =
        jdbc.query("SELECT * FROM machines WHERE owner_type = ? AND owner_id = ?", mapper, owner.type.name, owner.id.toString())

    override fun findAll(): List<Machine> = jdbc.query("SELECT * FROM machines", mapper)

    override fun delete(id: UUID) {
        jdbc.update("DELETE FROM machines WHERE id = ?", id.toString())
    }
}
