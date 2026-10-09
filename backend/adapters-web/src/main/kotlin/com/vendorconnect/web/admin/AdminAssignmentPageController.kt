package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.usecase.access.AssignmentAdminUseCase
import com.vendorconnect.application.usecase.access.AssignmentAdminUseCase.AssignmentView
import com.vendorconnect.application.usecase.access.RoleAdminUseCase
import com.vendorconnect.application.usecase.project.ProjectUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.AccessLevel
import com.vendorconnect.domain.access.AssignmentStatus
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.access.ScopeType
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Component
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.time.LocalDate
import java.util.UUID

@Controller
@RequestMapping("/admin/assignments")
class AdminAssignmentPageController(
    private val assignments: AssignmentAdminUseCase,
    private val roles: RoleAdminUseCase,
    private val users: UserUseCase,
    private val projects: ProjectUseCase,
    private val organizations: OrganizationDirectoryPort,
    private val rows: AssignmentRows
) {

    data class Option(val value: String, val label: String)

    /** What the new-assignment form posts, kept so a rejected form can be shown again as it was filled in. */
    data class AssignmentForm(
        val userId: String = "",
        val roleId: String = "",
        val organizationId: String = "",
        val projectId: String = "",
        val scopeType: String = ScopeType.ALL.name,
        val scopeRefs: String = "",
        val accessLevel: String = AccessLevel.FULL.name,
        val approvalLimit: String = "",
        val reviewerUserId: String = "",
        val validFrom: String = LocalDate.now().toString(),
        val validUntil: String = ""
    )

    @GetMapping
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun list(
        @RequestParam(required = false) roleId: String?,
        @RequestParam(required = false) show: String?,
        model: Model
    ): String {
        val role = roleId.toUuidOrNull()
        val filter = show.blankToNull()?.takeIf { it in FILTERS } ?: FILTER_CURRENT
        val found = assignments.list(null, role, null).filter {
            when (filter) {
                FILTER_USABLE -> it.usable
                FILTER_ALL -> true
                else -> it.assignment.status != AssignmentStatus.REVOKED
            }
        }
        model.addAttribute("rows", rows.of(found).sortedBy { it.user.lowercase() })
        model.addAttribute("roleOptions", roleOptions())
        model.addAttribute("roleId", role?.toString())
        model.addAttribute("show", filter)
        return "admin/assignments"
    }

    @GetMapping("/new")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun newForm(@RequestParam(required = false) userId: String?, model: Model): String =
        form(model, AssignmentForm(userId = userId.toUuidOrNull()?.toString().orEmpty()), null)

    @PostMapping
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun create(
        @RequestParam userId: String,
        @RequestParam roleId: String,
        @RequestParam(required = false) organizationId: String?,
        @RequestParam(required = false) projectId: String?,
        @RequestParam scopeType: ScopeType,
        @RequestParam(required = false) scopeRefs: String?,
        @RequestParam accessLevel: AccessLevel,
        @RequestParam(required = false) approvalLimit: String?,
        @RequestParam(required = false) reviewerUserId: String?,
        @RequestParam(required = false) validFrom: String?,
        @RequestParam(required = false) validUntil: String?,
        ctx: AccessContext,
        model: Model,
        redirect: RedirectAttributes
    ): String {
        val submitted = AssignmentForm(userId, roleId, organizationId.orEmpty(), projectId.orEmpty(), scopeType.name,
            scopeRefs.orEmpty(), accessLevel.name, approvalLimit.orEmpty(), reviewerUserId.orEmpty(),
            validFrom.blankToNull() ?: LocalDate.now().toString(), validUntil.orEmpty())
        return try {
            val view = assignments.create(
                ctx,
                AssignmentAdminUseCase.CreateAssignmentCommand(
                    userId = userId.toUuidOrNull() ?: throw DomainException("Choose a user."),
                    roleId = roleId.toUuidOrNull() ?: throw DomainException("Choose a role."),
                    organizationId = organizationId.toUuidOrNull(),
                    projectId = projectId.toUuidOrNull(),
                    scopeType = scopeType,
                    scopeRefs = scopeRefs.orEmpty().split(',', '\n').mapNotNullTo(mutableSetOf()) { it.blankToNull() },
                    accessLevel = accessLevel,
                    approvalLimit = parseMoney(approvalLimit, "Approval limit"),
                    reviewerUserId = reviewerUserId.toUuidOrNull(),
                    validFrom = validFrom.toDateOrNull() ?: LocalDate.now(),
                    validUntil = validUntil.toDateOrNull()
                )
            )
            redirect.addFlashAttribute(Flash.SUCCESS, "Assigned ${view.role.name}.")
            "redirect:/admin/assignments/${view.assignment.id}"
        } catch (e: DomainException) {
            form(model, submitted, e.message)
        }
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun detail(@PathVariable id: UUID, ctx: AccessContext, model: Model): String {
        val (view, effective) = assignments.effectiveAccess(id)
        model.addAttribute("a", rows.of(listOf(view)).single())
        model.addAttribute("revoked", view.assignment.status == AssignmentStatus.REVOKED)
        model.addAttribute("suspended", view.assignment.status == AssignmentStatus.SUSPENDED)
        model.addAttribute("isOwn", ctx.assignmentId == id)
        model.addAttribute("reviewer", view.assignment.reviewerUserId?.let(rows::userLabel))
        model.addAttribute("reviewerId", view.assignment.reviewerUserId?.toString())
        model.addAttribute("limitInput", view.assignment.approvalLimit?.amount?.toPlainString())
        model.addAttribute("effectivePermissions", effective.permissions.sorted())
        model.addAttribute("rolePermissionCount", view.role.permissions.size)
        model.addAttribute("accessLevels", AccessLevel.entries.map { it.name })
        model.addAttribute("userOptions", userOptions().filter { it.value != view.assignment.userId.toString() })
        return "admin/assignment"
    }

    @PostMapping("/{id}")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun update(
        @PathVariable id: UUID,
        @RequestParam accessLevel: AccessLevel,
        @RequestParam(required = false) approvalLimit: String?,
        @RequestParam(required = false) reviewerUserId: String?,
        @RequestParam(required = false) validUntil: String?,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        // The form always shows every field, so an empty one means "remove", not "leave as is".
        val limit = parseMoney(approvalLimit, "Approval limit")
        val reviewer = reviewerUserId.toUuidOrNull()
        val until = validUntil.toDateOrNull()
        assignments.update(
            ctx, id,
            AssignmentAdminUseCase.UpdateAssignmentCommand(
                accessLevel = accessLevel,
                approvalLimit = limit, clearApprovalLimit = limit == null,
                reviewerUserId = reviewer, clearReviewer = reviewer == null,
                validUntil = until, clearValidUntil = until == null
            )
        )
        redirect.addFlashAttribute(Flash.SUCCESS, "Assignment saved.")
        return "redirect:/admin/assignments/$id"
    }

    @PostMapping("/{id}/suspended")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun setSuspended(@PathVariable id: UUID, @RequestParam suspended: Boolean, ctx: AccessContext, redirect: RedirectAttributes): String {
        assignments.update(ctx, id, AssignmentAdminUseCase.UpdateAssignmentCommand(suspended = suspended))
        redirect.addFlashAttribute(Flash.SUCCESS, if (suspended) "Assignment suspended." else "Assignment resumed.")
        return "redirect:/admin/assignments/$id"
    }

    @PostMapping("/{id}/revoke")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun revoke(@PathVariable id: UUID, ctx: AccessContext, redirect: RedirectAttributes): String {
        assignments.revoke(ctx, id)
        redirect.addFlashAttribute(Flash.SUCCESS, "Assignment revoked.")
        return "redirect:/admin/assignments/$id"
    }

    private fun form(model: Model, form: AssignmentForm, error: String?): String {
        model.addAttribute("form", form)
        model.addAttribute("error", error)
        model.addAttribute("userOptions", userOptions())
        model.addAttribute("roleOptions", roleOptions(activeOnly = true, withLevel = true))
        model.addAttribute("organizationOptions", organizations.findAll().map { Option(it.id.toString(), "${it.name} (${it.code})") })
        model.addAttribute("projectOptions", projects.listAll().sortedBy { it.name }.map { Option(it.id.toString(), it.name) })
        model.addAttribute("scopeTypes", ScopeType.entries.map { it.name })
        model.addAttribute("accessLevels", AccessLevel.entries.map { it.name })
        return "admin/assignment-new"
    }

    private fun userOptions() = users.listAll().filter { it.isActive }.sortedBy { it.fullName.lowercase() }
        .map { Option(it.id.toString(), "${it.fullName} <${it.email}>") }

    private fun roleOptions(activeOnly: Boolean = false, withLevel: Boolean = false) = roles.list()
        .filter { !activeOnly || it.isActive }
        .map { Option(it.id.toString(), if (withLevel) "${it.name} (assigned at ${it.scopeLevel.name.lowercase()} level)" else it.name) }

    private companion object {
        const val FILTER_CURRENT = "current"
        const val FILTER_USABLE = "usable"
        const val FILTER_ALL = "all"
        val FILTERS = setOf(FILTER_CURRENT, FILTER_USABLE, FILTER_ALL)
    }
}

data class AssignmentRow(
    val id: UUID,
    val userId: UUID,
    val user: String,
    val roleId: UUID,
    val roleName: String,
    val roleKey: String,
    val where: String,
    val scope: String,
    val accessLevel: String,
    val approvalLimit: String?,
    val validFrom: String,
    val validUntil: String?,
    val status: String,
    val source: String,
    val usable: Boolean
)

/** Turns assignments into display rows, resolving user, organisation and project ids to names. */
@Component
class AssignmentRows(
    private val users: UserUseCase,
    private val projects: ProjectUseCase,
    private val organizations: OrganizationDirectoryPort
) {

    fun userLabel(id: UUID): String = runCatching { users.getById(id) }.map { "${it.fullName} <${it.email}>" }.getOrDefault(id.toString())

    fun of(views: List<AssignmentView>): List<AssignmentRow> {
        val userLabels = users.listAll().associate { it.id to "${it.fullName} <${it.email}>" }
        val placeLabels = organizations.findAll().associate { it.id to it.name } + projects.listAll().associate { it.id to it.name }

        return views.map { (a, role, usable) ->
            // An id whose record is gone is shown as it is rather than hidden.
            val places = listOfNotNull(a.organizationId, a.projectId).map { placeLabels[it] ?: it.toString() }
            AssignmentRow(
                id = a.id,
                userId = a.userId,
                user = userLabels[a.userId] ?: a.userId.toString(),
                roleId = role.id,
                roleName = role.name,
                roleKey = role.key,
                where = places.joinToString(" / ").ifEmpty { "Everywhere" },
                scope = if (a.scopeType == ScopeType.ALL) "All" else "${a.scopeType.name.lowercase()}: ${a.scopeRefs.sorted().joinToString()}",
                accessLevel = a.accessLevel.name,
                approvalLimit = a.approvalLimit?.display(),
                validFrom = a.validFrom.toString(),
                validUntil = a.validUntil?.toString(),
                status = a.status.name,
                source = a.source.name,
                usable = usable
            )
        }
    }
}
