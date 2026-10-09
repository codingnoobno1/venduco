package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.AuditLogPort
import com.vendorconnect.application.port.outbound.NewPackage
import com.vendorconnect.application.port.outbound.NewSection
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.ProjectStructureCommandPort
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.application.usecase.access.AssignmentAdminUseCase
import com.vendorconnect.application.usecase.project.ProjectAdminUseCase
import com.vendorconnect.application.usecase.project.ProjectStructureUseCase
import com.vendorconnect.application.usecase.project.ProjectUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.project.PackageStatus
import com.vendorconnect.domain.project.Project
import com.vendorconnect.domain.project.ProjectStatus
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.math.BigDecimal
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

/** Projects in the admin console: the portfolio, one project's structure, team and history, and changes to them. */
@Controller
@RequestMapping("/admin/projects")
class AdminProjectPageController(
    private val projects: ProjectUseCase,
    private val projectAdmin: ProjectAdminUseCase,
    private val structure: ProjectStructureUseCase,
    private val structureCommands: ProjectStructureCommandPort,
    private val tenders: TenderRepositoryPort,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserUseCase,
    private val assignments: AssignmentAdminUseCase,
    private val assignmentRows: AssignmentRows,
    private val auditLog: AuditLogPort
) {

    data class ProjectRow(
        val id: UUID,
        val name: String,
        val corridor: String,
        val company: String,
        val head: String,
        val status: String,
        val budget: String,
        val sections: Int,
        val packages: Int,
        val delayedPackages: Int,
        val tenders: Int
    )

    data class SectionRow(val id: String, val code: String, val name: String, val chainage: String, val lengthKm: Double,
                          val packages: Int, val contractors: String?, val value: String, val status: String)

    data class PackageRow(val id: String, val number: String, val sectionCode: String, val scope: String, val contractor: String?,
                          val contractorId: String, val value: String, val valueInput: String, val status: String)

    data class TenderRow(val id: UUID, val reference: String, val title: String, val status: String, val value: String, val closing: String?)

    data class HistoryRow(val at: String, val actor: String, val action: String, val summary: String)

    data class Option(val value: String, val label: String)

    /** What the project form posts, kept so a rejected form can be shown again. */
    data class ProjectForm(val name: String = "", val corridorName: String = "", val organizationId: String = "",
                           val projectHeadId: String = "", val budget: String = "", val status: String = ProjectStatus.PLANNING.name)

    @GetMapping
    @RequirePermission(Permissions.PROJECT_READ)
    fun list(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) status: String?,
        ctx: AccessContext,
        model: Model
    ): String {
        val query = q.blankToNull()?.lowercase()
        val wanted = status.blankToNull()?.takeIf { s -> ProjectStatus.entries.any { it.name == s } }
        val all = projects.listAll()
        val companies = organizations.findAll().associate { it.id to it.name }
        val people = users.listAll().associate { it.id to it.fullName }
        val tenderCounts = tenders.findAll().groupingBy { it.projectId }.eachCount()

        val rows = all
            .filter { query == null || query in it.name.lowercase() || query in it.corridorName.lowercase() }
            .filter { wanted == null || it.status.name == wanted }
            .sortedBy { it.name.lowercase() }
            .map { project ->
                val packages = structure.workPackages(project.id)
                ProjectRow(
                    id = project.id,
                    name = project.name,
                    corridor = project.corridorName,
                    company = companies[project.organizationId] ?: "Unknown company",
                    head = people[project.projectHeadId] ?: "Unknown person",
                    status = project.status.name,
                    budget = project.estimatedBudget.display(),
                    sections = structure.sections(project.id).size,
                    packages = packages.size,
                    delayedPackages = packages.count { it.status == PackageStatus.DELAYED.name },
                    tenders = tenderCounts[project.id] ?: 0
                )
            }

        model.addAttribute("rows", rows)
        model.addAttribute("q", q.blankToNull())
        model.addAttribute("status", wanted)
        model.addAttribute("statuses", ProjectStatus.entries.map { it.name })
        model.addAttribute("countByStatus", ProjectStatus.entries.associate { s -> s.name to all.count { it.status == s } })
        model.addAttribute("totalCount", all.size)
        model.addAttribute("portfolioBudget", totals(all.map { it.estimatedBudget }))
        model.addAttribute("canCreate", ctx.has(Permissions.PROJECT_CREATE))
        return "admin/projects"
    }

    @GetMapping("/new")
    @RequirePermission(Permissions.PROJECT_CREATE)
    fun newForm(model: Model): String = form(model, ProjectForm(), null, null)

    @PostMapping
    @RequirePermission(Permissions.PROJECT_CREATE)
    fun create(form: ProjectForm, ctx: AccessContext, model: Model, redirect: RedirectAttributes): String = try {
        val project = projectAdmin.create(ctx, command(form))
        redirect.addFlashAttribute(Flash.SUCCESS, "${project.name} created. Add its sections and work packages below.")
        "redirect:/admin/projects/${project.id}"
    } catch (e: DomainException) {
        form(model, form, null, e.message)
    }

    @GetMapping("/{id}/edit")
    @RequirePermission(Permissions.PROJECT_UPDATE)
    fun editForm(@PathVariable id: UUID, model: Model): String {
        val p = projects.getById(id)
        return form(model, ProjectForm(p.name, p.corridorName, p.organizationId.toString(), p.projectHeadId.toString(),
            p.estimatedBudget.amount.toPlainString(), p.status.name), p, null)
    }

    @PostMapping("/{id}")
    @RequirePermission(Permissions.PROJECT_UPDATE)
    fun update(@PathVariable id: UUID, form: ProjectForm, ctx: AccessContext, model: Model, redirect: RedirectAttributes): String = try {
        val project = projectAdmin.update(ctx, id, command(form))
        redirect.addFlashAttribute(Flash.SUCCESS, "${project.name} saved.")
        "redirect:/admin/projects/$id"
    } catch (e: DomainException) {
        form(model, form, projects.getById(id), e.message)
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.PROJECT_READ)
    fun detail(@PathVariable id: UUID, ctx: AccessContext, model: Model): String {
        val project = projects.getById(id)
        val companies = organizations.findAll()
        val companyNames = companies.associate { it.id to it.name }
        val sections = structure.sections(id)
        val packages = structure.workPackages(id)
        val projectTenders = tenders.findByProjectId(id).sortedByDescending { it.closingDate }

        model.addAttribute("project", project)
        model.addAttribute("company", companyNames[project.organizationId] ?: "Unknown company")
        model.addAttribute("head", runCatching { users.getById(project.projectHeadId) }.map { "${it.fullName} <${it.email}>" }
            .getOrDefault("Unknown person"))
        model.addAttribute("budget", project.estimatedBudget.display())
        model.addAttribute("packagedValue", totals(packages.map { rupees(it.plannedValue) }))
        model.addAttribute("totalKm", sections.sumOf { it.lengthKm })
        model.addAttribute("sections", sections.map { s ->
            val inSection = packages.filter { it.sectionCode == s.sectionCode }
            SectionRow(s.id, s.sectionCode, s.name, s.chainageRange, s.lengthKm, inSection.size, s.contractorName,
                rupees(s.plannedValue).display(), s.status)
        })
        model.addAttribute("packages", packages.map { p ->
            val stored = structureCommands.findPackage(UUID.fromString(p.id))
            PackageRow(p.id, p.packageCode, p.sectionCode, p.workScope, p.contractorName, stored?.contractorId?.toString().orEmpty(),
                rupees(p.plannedValue).display(), stored?.estimatedValue?.amount?.toPlainString() ?: p.plannedValue.toString(), p.status)
        })
        model.addAttribute("packageCountByStatus", PackageStatus.entries.associate { s -> s.name to packages.count { it.status == s.name } })
        model.addAttribute("tenders", projectTenders.map {
            TenderRow(it.id, it.referenceNumber, it.title, it.status.name, it.estimatedValue.display(), it.closingDate?.toString())
        })
        model.addAttribute("sectionOptions", sections.map { Option(it.id, "${it.sectionCode} · ${it.name}") })
        model.addAttribute("companyOptions", companies.sortedBy { it.name.lowercase() }.map { Option(it.id.toString(), it.name) })
        model.addAttribute("packageStatuses", PackageStatus.entries.map { it.name })
        model.addAttribute("canEdit", ctx.has(Permissions.PROJECT_UPDATE))
        model.addAttribute("canEditSections", ctx.has(Permissions.SECTION_UPDATE))
        model.addAttribute("canEditPackages", ctx.has(Permissions.PACKAGE_UPDATE))
        model.addAttribute("canSeeTenders", ctx.has(Permissions.TENDER_READ))
        if (ctx.has(Permissions.ADMIN_ASSIGNMENT_MANAGE)) {
            model.addAttribute("team", assignmentRows.of(assignments.list(null, null, id)))
        }
        if (ctx.has(Permissions.ADMIN_AUDIT_READ)) {
            val emails = users.listAll().associate { it.id to it.email }
            model.addAttribute("history", auditLog.findRecent("PROJECT", id.toString(), null, HISTORY_SIZE).map {
                HistoryRow(TIMESTAMP.format(it.occurredAt.atZone(ZoneId.systemDefault())),
                    it.actorUserId?.let { u -> emails[u] ?: u.toString() } ?: "system", it.action, it.summary)
            })
        }
        return "admin/project"
    }

    @PostMapping("/{id}/sections")
    @RequirePermission(Permissions.SECTION_UPDATE)
    fun addSection(
        @PathVariable id: UUID,
        @RequestParam name: String,
        @RequestParam(required = false) startLabel: String?,
        @RequestParam(required = false) endLabel: String?,
        @RequestParam startLatitude: Double,
        @RequestParam startLongitude: Double,
        @RequestParam endLatitude: Double,
        @RequestParam endLongitude: Double,
        @RequestParam lengthKm: Double,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        projectAdmin.addSection(ctx, id, NewSection(name, startLatitude, startLongitude, startLabel, endLatitude, endLongitude, endLabel, lengthKm))
        redirect.addFlashAttribute(Flash.SUCCESS, "Section ${name.trim()} added.")
        return "redirect:/admin/projects/$id#sections"
    }

    @PostMapping("/{id}/packages")
    @RequirePermission(Permissions.PACKAGE_UPDATE)
    fun addPackage(
        @PathVariable id: UUID,
        @RequestParam sectionId: UUID,
        @RequestParam packageNumber: String,
        @RequestParam description: String,
        @RequestParam(required = false) contractorId: String?,
        @RequestParam status: PackageStatus,
        @RequestParam(required = false) value: String?,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        projectAdmin.addPackage(ctx, sectionId, NewPackage(packageNumber, description, contractorId.toUuidOrNull(), status,
            parseMoney(value, "Package value") ?: Money(BigDecimal.ZERO)))
        redirect.addFlashAttribute(Flash.SUCCESS, "Package ${packageNumber.trim().uppercase()} added.")
        return "redirect:/admin/projects/$id#packages"
    }

    @PostMapping("/{id}/packages/{packageId}")
    @RequirePermission(Permissions.PACKAGE_UPDATE)
    fun updatePackage(
        @PathVariable id: UUID,
        @PathVariable packageId: UUID,
        @RequestParam status: PackageStatus,
        @RequestParam(required = false) contractorId: String?,
        @RequestParam(required = false) value: String?,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        projectAdmin.updatePackage(ctx, packageId, status, contractorId.toUuidOrNull(), parseMoney(value, "Package value") ?: Money(BigDecimal.ZERO))
        redirect.addFlashAttribute(Flash.SUCCESS, "Package saved.")
        return "redirect:/admin/projects/$id#packages"
    }

    private fun command(form: ProjectForm) = ProjectAdminUseCase.ProjectCommand(
        name = form.name,
        corridorName = form.corridorName,
        organizationId = form.organizationId.toUuidOrNull() ?: throw DomainException("Choose the company that owns the project."),
        projectHeadId = form.projectHeadId.toUuidOrNull() ?: throw DomainException("Choose the project head."),
        estimatedBudget = parseMoney(form.budget, "Budget") ?: throw DomainException("Enter the estimated budget."),
        status = ProjectStatus.entries.firstOrNull { it.name == form.status } ?: ProjectStatus.PLANNING
    )

    private fun form(model: Model, form: ProjectForm, existing: Project?, error: String?): String {
        model.addAttribute("form", form)
        model.addAttribute("existing", existing)
        model.addAttribute("error", error)
        model.addAttribute("statuses", ProjectStatus.entries.map { it.name })
        model.addAttribute("companyOptions", organizations.findAll().sortedBy { it.name.lowercase() }.map { Option(it.id.toString(), "${it.name} (${it.code})") })
        model.addAttribute("headOptions", users.listAll().filter { it.isActive }.sortedBy { it.fullName.lowercase() }
            .map { Option(it.id.toString(), "${it.fullName} <${it.email}>") })
        return "admin/project-form"
    }

    /** Totals per currency, so INR and another currency are never added together. */
    private fun totals(amounts: List<Money>): String =
        amounts.groupBy { it.currency }.values.map { group -> group.reduce(Money::plus).display() }.joinToString(" + ").ifEmpty { "—" }

    private fun rupees(wholeUnits: Long) = Money(BigDecimal.valueOf(wholeUnits))

    private companion object {
        const val HISTORY_SIZE = 50
        val TIMESTAMP: DateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")
    }
}
