package com.vendorconnect.application.usecase.fleet

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.domain.shared.DuplicateEntityException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.FieldErrorsException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

enum class MachineStatus { AVAILABLE, ASSIGNED, MAINTENANCE }

data class Machine(
    val id: UUID = UUID.randomUUID(),
    val owner: SubjectRef,
    val machineCode: String,
    val name: String?,
    val machineType: String,
    val manufacturer: String?,
    val model: String?,
    val yearOfManufacture: Int?,
    val capacity: String?,
    val location: String?,
    val registrationNumber: String?,
    val insuranceExpiry: LocalDate?,
    val lastMaintenanceDate: LocalDate?,
    val status: MachineStatus = MachineStatus.AVAILABLE,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

interface MachineRepositoryPort {
    fun save(machine: Machine): Machine
    fun findById(id: UUID): Machine?
    fun findByOwner(owner: SubjectRef): List<Machine>
    fun findAll(): List<Machine>
    fun delete(id: UUID)
}

/**
 * The fleet register: machines a vendor or contractor owns.
 *
 * An owner sees and changes only their own machines. People who hold `fleet:read-all` (buyers,
 * administrators) see every machine but change none: a machine is its owner's record.
 */
@Service
class FleetUseCase(
    private val machines: MachineRepositoryPort,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserRepositoryPort
) {

    data class MachineView(val machine: Machine, val ownerName: String, val mine: Boolean)

    /** Everything optional is a nullable string straight from a form; blank means "not given". */
    data class MachineInput(
        val machineCode: String?,
        val name: String?,
        val machineType: String?,
        val manufacturer: String?,
        val model: String?,
        val yearOfManufacture: Int?,
        val capacity: String?,
        val location: String?,
        val registrationNumber: String?,
        val insuranceExpiry: String?,
        val lastMaintenanceDate: String?,
        val status: String?
    )

    @Transactional(readOnly = true)
    fun list(ctx: AccessContext): List<MachineView> {
        val found = if (ctx.has(Permissions.FLEET_READ_ALL)) machines.findAll() else machines.findByOwner(ownerOf(ctx))
        return found.sortedBy { it.machineCode }.map { view(ctx, it) }
    }

    @Transactional(readOnly = true)
    fun get(ctx: AccessContext, id: UUID): MachineView = view(ctx, visible(ctx, id))

    @Transactional
    fun create(ctx: AccessContext, input: MachineInput): MachineView {
        val owner = ownerOf(ctx)
        val machine = apply(Machine(owner = owner, machineCode = "", name = null, machineType = "", manufacturer = null, model = null,
            yearOfManufacture = null, capacity = null, location = null, registrationNumber = null, insuranceExpiry = null,
            lastMaintenanceDate = null), input)
        requireUniqueCode(owner, machine)
        return view(ctx, machines.save(machine))
    }

    @Transactional
    fun update(ctx: AccessContext, id: UUID, input: MachineInput): MachineView {
        val machine = apply(owned(ctx, id), input).copy(updatedAt = Instant.now())
        requireUniqueCode(machine.owner, machine)
        return view(ctx, machines.save(machine))
    }

    @Transactional
    fun delete(ctx: AccessContext, id: UUID) {
        machines.delete(owned(ctx, id).id)
    }

    private fun ownerOf(ctx: AccessContext): SubjectRef =
        ctx.organizationId?.let { SubjectRef(SubjectType.ORGANIZATION, it) } ?: SubjectRef(SubjectType.USER, ctx.userId)

    /** A machine the caller may see; anything else is reported as not existing. */
    private fun visible(ctx: AccessContext, id: UUID): Machine {
        val machine = machines.findById(id) ?: throw EntityNotFoundException("Machine", id)
        if (machine.owner != ownerOf(ctx) && !ctx.has(Permissions.FLEET_READ_ALL)) throw EntityNotFoundException("Machine", id)
        return machine
    }

    /** Only the owner changes a machine, whoever else can see it. */
    private fun owned(ctx: AccessContext, id: UUID): Machine =
        machines.findById(id)?.takeIf { it.owner == ownerOf(ctx) } ?: throw EntityNotFoundException("Machine", id)

    private fun requireUniqueCode(owner: SubjectRef, machine: Machine) {
        if (machines.findByOwner(owner).any { it.id != machine.id && it.machineCode.equals(machine.machineCode, ignoreCase = true) }) {
            throw DuplicateEntityException("Machine", "code", machine.machineCode)
        }
    }

    private fun apply(machine: Machine, input: MachineInput): Machine {
        val errors = linkedMapOf<String, String>()
        fun text(value: String?, max: Int, field: String): String? =
            value?.trim()?.takeIf { it.isNotEmpty() }?.also { if (it.length > max) errors[field] = "Keep this under $max characters." }

        fun date(value: String?, field: String, allowFuture: Boolean): LocalDate? {
            val raw = value?.trim()?.takeIf { it.isNotEmpty() } ?: return null
            val parsed = runCatching { LocalDate.parse(raw.take(10)) }.getOrNull()
            if (parsed == null) errors[field] = "Enter a valid date."
            else if (!allowFuture && parsed.isAfter(LocalDate.now())) errors[field] = "This date cannot be in the future."
            return parsed
        }

        val code = text(input.machineCode, 40, "machineCode")?.uppercase()
        if (code == null) errors["machineCode"] = "Give the machine a code."
        val type = text(input.machineType, 40, "machineType")?.uppercase()
        if (type == null || !MACHINE_TYPE.matches(type)) errors["machineType"] = "Choose a machine type."
        val year = input.yearOfManufacture
        if (year != null && year !in 1950..LocalDate.now().year + 1) errors["yearOfManufacture"] = "Enter a year between 1950 and next year."
        val status = input.status?.trim()?.takeIf { it.isNotEmpty() }?.let { raw ->
            MachineStatus.entries.firstOrNull { it.name == raw.uppercase() } ?: null.also { errors["status"] = "Unknown status." }
        }

        val updated = machine.copy(
            machineCode = code.orEmpty(),
            name = text(input.name, 120, "name"),
            machineType = type.orEmpty(),
            manufacturer = text(input.manufacturer, 80, "manufacturer"),
            model = text(input.model, 80, "model"),
            yearOfManufacture = year,
            capacity = text(input.capacity, 80, "capacity"),
            location = text(input.location, 160, "location"),
            registrationNumber = text(input.registrationNumber, 40, "registrationNumber")?.uppercase(),
            insuranceExpiry = date(input.insuranceExpiry, "insuranceExpiry", allowFuture = true),
            lastMaintenanceDate = date(input.lastMaintenanceDate, "lastMaintenanceDate", allowFuture = false),
            status = status ?: machine.status
        )
        if (errors.isNotEmpty()) throw FieldErrorsException(errors)
        return updated
    }

    private fun view(ctx: AccessContext, machine: Machine) = MachineView(
        machine = machine,
        ownerName = when (machine.owner.type) {
            SubjectType.ORGANIZATION -> organizations.findById(machine.owner.id)?.name
            SubjectType.USER -> users.findById(machine.owner.id)?.fullName
        } ?: "(removed)",
        mine = machine.owner == ownerOf(ctx)
    )

    private companion object {
        val MACHINE_TYPE = Regex("^[A-Z][A-Z0-9_]{1,39}$")
    }
}
