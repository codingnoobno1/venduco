package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.usecase.access.AssignmentAdminUseCase
import com.vendorconnect.application.usecase.account.BillingUseCase
import com.vendorconnect.application.usecase.user.UserAdminUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.user.User
import com.vendorconnect.domain.user.UserRole
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.util.UUID

@Controller
@RequestMapping("/admin/users")
class AdminUserPageController(
    private val users: UserUseCase,
    private val userAdmin: UserAdminUseCase,
    private val assignments: AssignmentAdminUseCase,
    private val assignmentRows: AssignmentRows,
    private val organizations: OrganizationDirectoryPort,
    private val billing: BillingUseCase
) {

    data class UserRow(
        val id: UUID,
        val fullName: String,
        val email: String,
        val legacyRole: String,
        val active: Boolean,
        val approval: String,
        val approvalNote: String?,
        val companyId: UUID?,
        val company: String?,
        val usableAssignments: Int,
        val isSelf: Boolean
    )

    data class Option(val value: String, val label: String)

    /** What the new-user form posts, kept so a rejected form can be shown again. The password is never echoed back. */
    data class UserForm(val email: String = "", val fullName: String = "", val role: String = UserRole.VENDOR.name,
                        val organizationId: String = "")

    @GetMapping
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun list(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) approval: String?,
        ctx: AccessContext,
        model: Model
    ): String {
        val query = q.blankToNull()?.lowercase()
        val wanted = approval.blankToNull()?.takeIf { a -> ApprovalStatus.entries.any { it.name == a } }
        // Assignment counts are extra detail; without the permission to see assignments the column is left out.
        val usableByUser = if (ctx.has(Permissions.ADMIN_ASSIGNMENT_MANAGE)) {
            assignments.list(null, null, null).filter { it.usable }.groupingBy { it.assignment.userId }.eachCount()
        } else null
        val companies = organizations.findAll().associate { it.id to it.name }

        val rows = users.listAll()
            .filter { query == null || query in it.fullName.lowercase() || query in it.email.lowercase() }
            .filter { wanted == null || it.approvalStatus.name == wanted }
            .sortedBy { it.fullName.lowercase() }
            .map { row(it, ctx, companies, usableByUser?.get(it.id) ?: 0) }

        model.addAttribute("rows", rows)
        model.addAttribute("q", q.blankToNull())
        model.addAttribute("approval", wanted)
        model.addAttribute("approvals", ApprovalStatus.entries.map { it.name })
        model.addAttribute("showAssignments", usableByUser != null)
        return "admin/users"
    }

    @GetMapping("/new")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun newForm(@RequestParam(required = false) organizationId: String?, model: Model): String =
        form(model, UserForm(organizationId = organizationId.toUuidOrNull()?.toString().orEmpty()), null)

    @PostMapping
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun create(
        @RequestParam email: String,
        @RequestParam fullName: String,
        @RequestParam password: String,
        @RequestParam role: UserRole,
        @RequestParam(required = false) organizationId: String?,
        ctx: AccessContext,
        model: Model,
        redirect: RedirectAttributes
    ): String = try {
        val user = userAdmin.createUser(
            ctx, UserAdminUseCase.CreateUserCommand(email, fullName, password, role, organizationId.toUuidOrNull())
        )
        redirect.addFlashAttribute(Flash.SUCCESS, "${user.email} created. Pass the initial password to them directly; it is not shown again.")
        "redirect:/admin/users/${user.id}"
    } catch (e: DomainException) {
        form(model, UserForm(email, fullName, role.name, organizationId.orEmpty()), e.message)
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun detail(@PathVariable id: UUID, ctx: AccessContext, model: Model): String {
        val user = users.getById(id)
        val companies = organizations.findAll().associate { it.id to it.name }
        model.addAttribute("user", row(user, ctx, companies, 0))
        model.addAttribute("legacyRoles", UserRole.entries.map { it.name })
        model.addAttribute("canApprove", ctx.has(Permissions.ADMIN_APPROVAL_MANAGE))
        if (ctx.has(Permissions.ADMIN_ASSIGNMENT_MANAGE)) {
            model.addAttribute("assignments", assignmentRows.of(assignments.list(id, null, null)))
        }
        // An individual is billed directly; someone in a company is covered by the company's subscription.
        if (ctx.has(Permissions.ADMIN_BILLING_MANAGE) && user.organizationId == null) {
            model.addAttribute("showBilling", true)
            model.addAttribute("subscription", billing.subscriptionFor(SubjectRef(SubjectType.USER, id))?.let(AdminBillingPageController::row))
            model.addAttribute("planOptions", billing.plans().filter { it.isActive && it.suits(SubjectType.USER) }
                .map { Option(it.id.toString(), "${it.name} · ${it.monthlyPrice.display()} per month") })
        }
        return "admin/user"
    }

    @PostMapping("/{id}/active")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun setActive(@PathVariable id: UUID, @RequestParam active: Boolean, ctx: AccessContext, redirect: RedirectAttributes): String {
        val user = userAdmin.updateUser(ctx, UserAdminUseCase.UpdateUserCommand(userId = id, active = active))
        redirect.addFlashAttribute(Flash.SUCCESS, "${user.email} is now ${if (user.isActive) "active" else "deactivated"}.")
        return "redirect:/admin/users/$id"
    }

    @PostMapping("/{id}/role")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun setLegacyRole(@PathVariable id: UUID, @RequestParam role: UserRole, ctx: AccessContext, redirect: RedirectAttributes): String {
        val user = userAdmin.updateUser(ctx, UserAdminUseCase.UpdateUserCommand(userId = id, role = role))
        redirect.addFlashAttribute(Flash.SUCCESS, "${user.email} now has the base role ${user.role}.")
        return "redirect:/admin/users/$id"
    }

    private fun form(model: Model, form: UserForm, error: String?): String {
        model.addAttribute("form", form)
        model.addAttribute("error", error)
        model.addAttribute("legacyRoles", UserRole.entries.map { it.name })
        model.addAttribute("companyOptions", organizations.findAll().map { Option(it.id.toString(), "${it.name} (${it.code})") })
        return "admin/user-new"
    }

    private fun row(user: User, ctx: AccessContext, companies: Map<UUID, String>, usableAssignments: Int) = UserRow(
        id = user.id,
        fullName = user.fullName,
        email = user.email,
        legacyRole = user.role.name,
        active = user.isActive,
        approval = user.approvalStatus.name,
        approvalNote = user.approvalNote,
        companyId = user.organizationId,
        company = user.organizationId?.let(companies::get),
        usableAssignments = usableAssignments,
        isSelf = user.id == ctx.userId
    )
}
