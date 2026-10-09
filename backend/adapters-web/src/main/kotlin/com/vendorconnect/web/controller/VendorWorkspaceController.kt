package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.fleet.FleetUseCase
import com.vendorconnect.application.usecase.fleet.FleetUseCase.MachineView
import com.vendorconnect.application.usecase.partner.PartnerTenderUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.security.RequirePermission
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

/**
 * Endpoints behind the vendor workspace under `/dashboard/vendor`: the fleet register and a list of
 * the caller's own bids.
 *
 * Those pages predate this backend and read a `{ success, data }` envelope with `_id` keys, so that
 * is the shape returned here. New screens should use the plain shapes of the other controllers.
 */
@RestController
@RequestMapping("/api/v1")
class VendorWorkspaceController(
    private val fleet: FleetUseCase,
    private val tenders: PartnerTenderUseCase
) {

    data class Envelope<T>(val data: T, val success: Boolean = true)

    data class MachineDto(
        val _id: String,
        val machineCode: String,
        val name: String?,
        val machineType: String,
        val manufacturer: String?,
        val model: String?,
        val yearOfManufacture: Int?,
        val capacity: String?,
        val location: String?,
        val registrationNumber: String?,
        val insuranceExpiry: String?,
        val lastMaintenanceDate: String?,
        /** Same date under the name the fleet cards read. */
        val lastMaintenance: String?,
        val status: String,
        val ownerName: String,
        /** Whether the caller owns this machine and may therefore change it. */
        val mine: Boolean
    )

    data class MachineRequest(
        val machineCode: String? = null,
        val name: String? = null,
        val machineType: String? = null,
        val manufacturer: String? = null,
        val model: String? = null,
        val yearOfManufacture: Int? = null,
        val capacity: String? = null,
        val location: String? = null,
        val registrationNumber: String? = null,
        val insuranceExpiry: String? = null,
        val lastMaintenanceDate: String? = null,
        val status: String? = null
    ) {
        fun toInput() = FleetUseCase.MachineInput(machineCode, name, machineType, manufacturer, model, yearOfManufacture, capacity,
            location, registrationNumber, insuranceExpiry, lastMaintenanceDate, status)
    }

    data class MyBidDto(
        val _id: String,
        val tenderId: String,
        val title: String,
        val referenceNumber: String,
        val project: String?,
        val status: String,
        val amount: MoneyDto?,
        val closingDate: String?,
        val tenderOpen: Boolean,
        val submittedAt: String?,
        /** AWARDED_TO_YOU or NOT_SELECTED once the tender has been awarded. */
        val outcome: String?
    )

    // ── Fleet ──

    @GetMapping("/machines")
    @RequirePermission(Permissions.FLEET_READ)
    fun machines(ctx: AccessContext) = Envelope(fleet.list(ctx).map { it.toDto() })

    @GetMapping("/machines/{id}")
    @RequirePermission(Permissions.FLEET_READ)
    fun machine(@PathVariable id: UUID, ctx: AccessContext) = Envelope(fleet.get(ctx, id).toDto())

    @PostMapping("/machines")
    @RequirePermission(Permissions.FLEET_MANAGE)
    fun createMachine(@RequestBody request: MachineRequest, ctx: AccessContext): ResponseEntity<Envelope<MachineDto>> =
        ResponseEntity.status(HttpStatus.CREATED).body(Envelope(fleet.create(ctx, request.toInput()).toDto()))

    @PutMapping("/machines/{id}")
    @RequirePermission(Permissions.FLEET_MANAGE)
    fun updateMachine(@PathVariable id: UUID, @RequestBody request: MachineRequest, ctx: AccessContext) =
        Envelope(fleet.update(ctx, id, request.toInput()).toDto())

    @DeleteMapping("/machines/{id}")
    @RequirePermission(Permissions.FLEET_MANAGE)
    fun deleteMachine(@PathVariable id: UUID, ctx: AccessContext): Envelope<Map<String, String>> {
        fleet.delete(ctx, id)
        return Envelope(mapOf("message" to "Machine removed"))
    }

    // ── Bids ──

    /** Every tender the caller has a bid on, drafts included. */
    @GetMapping("/bids/my")
    @RequirePermission(Permissions.BID_SUBMIT)
    fun myBids(ctx: AccessContext) = Envelope(
        tenders.visibleTenders(ctx).filter { it.bid != null }.map { view ->
            val bid = view.bid!!
            MyBidDto(
                _id = bid.id.toString(),
                tenderId = view.tender.id.toString(),
                title = view.tender.title,
                referenceNumber = view.tender.referenceNumber,
                project = view.projectName,
                status = bid.status.name,
                amount = bid.amount?.toDto(),
                closingDate = view.tender.closingDate?.toString(),
                tenderOpen = view.open,
                submittedAt = bid.submittedAt?.toString(),
                outcome = view.won?.let { if (it) "AWARDED_TO_YOU" else "NOT_SELECTED" }
            )
        }
    )

    private fun MachineView.toDto() = MachineDto(
        _id = machine.id.toString(),
        machineCode = machine.machineCode,
        name = machine.name,
        machineType = machine.machineType,
        manufacturer = machine.manufacturer,
        model = machine.model,
        yearOfManufacture = machine.yearOfManufacture,
        capacity = machine.capacity,
        location = machine.location,
        registrationNumber = machine.registrationNumber,
        insuranceExpiry = machine.insuranceExpiry?.toString(),
        lastMaintenanceDate = machine.lastMaintenanceDate?.toString(),
        lastMaintenance = machine.lastMaintenanceDate?.toString(),
        status = machine.status.name,
        ownerName = ownerName,
        mine = mine
    )
}
