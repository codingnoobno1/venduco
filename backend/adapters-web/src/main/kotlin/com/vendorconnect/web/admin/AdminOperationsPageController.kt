package com.vendorconnect.web.admin

import com.vendorconnect.application.port.inbound.ConnectivityQueries
import com.vendorconnect.application.port.outbound.AiServicePort
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.application.usecase.fleet.FleetUseCase
import com.vendorconnect.application.usecase.fleet.MachineStatus
import com.vendorconnect.application.usecase.project.ProjectUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import java.lang.management.ManagementFactory
import java.time.Duration
import java.time.LocalDate

/** The fleet register across all owners, and the system status page. */
@Controller
class AdminOperationsPageController(
    private val fleet: FleetUseCase,
    private val connectivity: ConnectivityQueries,
    private val ai: AiServicePort,
    private val projects: ProjectUseCase,
    private val tenders: TenderRepositoryPort,
    private val users: UserUseCase,
    private val organizations: OrganizationDirectoryPort
) {

    data class MachineRow(
        val code: String,
        val name: String?,
        val type: String,
        val makeModel: String?,
        val owner: String,
        val location: String?,
        val registration: String?,
        val status: String,
        val insuranceExpiry: String?,
        val insuranceState: String?,
        val lastMaintenance: String?
    )

    data class Check(val name: String, val ok: Boolean, val detail: String)

    @GetMapping("/admin/fleet")
    @RequirePermission(Permissions.FLEET_READ_ALL)
    fun fleet(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) attention: Boolean?,
        ctx: AccessContext,
        model: Model
    ): String {
        val query = q.blankToNull()?.lowercase()
        val wanted = status.blankToNull()?.takeIf { s -> MachineStatus.entries.any { it.name == s } }
        val today = LocalDate.now()
        val soon = today.plusDays(INSURANCE_WARNING_DAYS)
        val all = fleet.list(ctx)

        fun insuranceState(expiry: LocalDate?) = when {
            expiry == null -> null
            expiry.isBefore(today) -> "EXPIRED"
            expiry.isBefore(soon) -> "EXPIRING"
            else -> "VALID"
        }

        val rows = all
            .filter { v ->
                query == null || listOfNotNull(v.machine.machineCode, v.machine.name, v.machine.machineType, v.ownerName, v.machine.location)
                    .any { query in it.lowercase() }
            }
            .filter { wanted == null || it.machine.status.name == wanted }
            .filter { attention != true || insuranceState(it.machine.insuranceExpiry) in setOf("EXPIRED", "EXPIRING") }
            .map { v ->
                val m = v.machine
                MachineRow(
                    code = m.machineCode,
                    name = m.name,
                    type = m.machineType,
                    makeModel = listOfNotNull(m.manufacturer, m.model, m.yearOfManufacture?.toString()).joinToString(" ").ifBlank { null },
                    owner = v.ownerName,
                    location = m.location,
                    registration = m.registrationNumber,
                    status = m.status.name,
                    insuranceExpiry = m.insuranceExpiry?.toString(),
                    insuranceState = insuranceState(m.insuranceExpiry),
                    lastMaintenance = m.lastMaintenanceDate?.toString()
                )
            }

        model.addAttribute("rows", rows)
        model.addAttribute("q", q.blankToNull())
        model.addAttribute("status", wanted)
        model.addAttribute("attention", attention == true)
        model.addAttribute("statuses", MachineStatus.entries.map { it.name })
        model.addAttribute("totalCount", all.size)
        model.addAttribute("ownerCount", all.map { it.ownerName }.distinct().size)
        model.addAttribute("countByStatus", MachineStatus.entries.associate { s -> s.name to all.count { it.machine.status == s } })
        model.addAttribute("insuranceAttention", all.count { insuranceState(it.machine.insuranceExpiry) in setOf("EXPIRED", "EXPIRING") })
        return "admin/fleet"
    }

    @GetMapping("/admin/system")
    @RequirePermission(Permissions.ADMIN_SETTINGS_MANAGE)
    fun system(model: Model): String {
        val report = connectivity.check()
        val aiReachable = runCatching { ai.isAvailable() }
        val checks = report.checks.map { Check(it.layer.replaceFirstChar(Char::uppercase), it.reachable, it.detail) } +
            Check("AI analysis service", aiReachable.getOrDefault(false),
                aiReachable.fold({ if (it) "answering" else "not answering; tender analysis falls back to no result" },
                    { "check failed: ${it.message ?: it.javaClass.simpleName}" }))

        val runtime = ManagementFactory.getRuntimeMXBean()
        val memory = Runtime.getRuntime()
        model.addAttribute("checks", checks)
        model.addAttribute("allOk", checks.all { it.ok })
        model.addAttribute("counts", linkedMapOf(
            "Users" to users.listAll().size,
            "Companies" to organizations.findAll().size,
            "Projects" to projects.listAll().size,
            "Tenders" to tenders.findAll().size
        ))
        model.addAttribute("uptime", humanDuration(Duration.ofMillis(runtime.uptime)))
        model.addAttribute("javaVersion", System.getProperty("java.version"))
        model.addAttribute("memory", "${(memory.totalMemory() - memory.freeMemory()) / MB} MB used of ${memory.maxMemory() / MB} MB")
        model.addAttribute("processors", memory.availableProcessors())
        return "admin/system"
    }

    private fun humanDuration(d: Duration): String = when {
        d.toDays() > 0 -> "${d.toDays()} d ${d.toHoursPart()} h"
        d.toHours() > 0 -> "${d.toHours()} h ${d.toMinutesPart()} min"
        else -> "${d.toMinutes()} min"
    }

    private companion object {
        const val INSURANCE_WARNING_DAYS = 30L
        const val MB = 1024 * 1024
    }
}
