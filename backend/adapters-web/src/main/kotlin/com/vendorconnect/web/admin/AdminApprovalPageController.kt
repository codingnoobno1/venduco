package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.usecase.account.BillingUseCase
import com.vendorconnect.application.usecase.account.OnboardingUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

/**
 * Approval of companies and of individual people, and the company directory.
 * A company is approved as a whole (optionally with everyone waiting inside it); a person can
 * also be approved, rejected or suspended on their own.
 */
@Controller
class AdminApprovalPageController(
    private val onboarding: OnboardingUseCase,
    private val users: UserUseCase,
    private val organizations: OrganizationDirectoryPort,
    private val billing: BillingUseCase
) {

    data class CompanyRow(val id: UUID, val name: String, val code: String, val type: String, val status: String,
                          val note: String?, val members: Int, val pendingMembers: Int, val registered: String?,
                          val standing: String?)

    data class PersonRow(val id: UUID, val fullName: String, val email: String, val companyId: UUID?, val company: String?,
                         val status: String, val note: String?, val active: Boolean, val registered: String, val isSelf: Boolean)

    data class Option(val value: String, val label: String)

    @GetMapping("/admin/approvals")
    @RequirePermission(Permissions.ADMIN_APPROVAL_MANAGE)
    fun approvals(
        @RequestParam(required = false) tab: String?,
        @RequestParam(required = false) show: String?,
        ctx: AccessContext,
        model: Model
    ): String {
        val individuals = tab == TAB_INDIVIDUALS
        val all = show == SHOW_ALL
        val companies = companyRows(withStanding = false)
        val people = personRows(ctx)

        model.addAttribute("tab", if (individuals) TAB_INDIVIDUALS else TAB_COMPANIES)
        model.addAttribute("show", if (all) SHOW_ALL else SHOW_PENDING)
        model.addAttribute("pendingCompanies", companies.count { it.status == PENDING })
        model.addAttribute("pendingPeople", people.count { it.status == PENDING })
        model.addAttribute("companies", companies.filter { all || it.status == PENDING }.sortedBy { it.status != PENDING })
        model.addAttribute("people", people.filter { all || it.status == PENDING }.sortedBy { it.status != PENDING })
        return "admin/approvals"
    }

    @GetMapping("/admin/companies")
    @RequirePermission(Permissions.ADMIN_APPROVAL_MANAGE)
    fun companies(@RequestParam(required = false) q: String?, @RequestParam(required = false) status: String?,
                  ctx: AccessContext, model: Model): String {
        val query = q.blankToNull()?.lowercase()
        val wanted = status.blankToNull()?.takeIf { s -> ApprovalStatus.entries.any { it.name == s } }
        model.addAttribute("rows", companyRows(withStanding = ctx.has(Permissions.ADMIN_BILLING_MANAGE)).filter {
            (query == null || query in it.name.lowercase() || query in it.code.lowercase()) && (wanted == null || it.status == wanted)
        })
        model.addAttribute("q", q.blankToNull())
        model.addAttribute("status", wanted)
        model.addAttribute("statuses", ApprovalStatus.entries.map { it.name })
        model.addAttribute("showBilling", ctx.has(Permissions.ADMIN_BILLING_MANAGE))
        return "admin/companies"
    }

    @GetMapping("/admin/companies/new")
    @RequirePermission(Permissions.ADMIN_APPROVAL_MANAGE)
    fun newCompany(model: Model): String = companyForm(model, "", OnboardingUseCase.COMPANY_TYPES.first(), null)

    @PostMapping("/admin/companies")
    @RequirePermission(Permissions.ADMIN_APPROVAL_MANAGE)
    fun createCompany(@RequestParam name: String, @RequestParam type: String, ctx: AccessContext, model: Model,
                      redirect: RedirectAttributes): String = try {
        val company = onboarding.createCompany(ctx, name, type)
        redirect.addFlashAttribute(Flash.SUCCESS, "${company.name} created and approved.")
        "redirect:/admin/companies/${company.id}"
    } catch (e: DomainException) {
        companyForm(model, name, type, e.message)
    }

    @GetMapping("/admin/companies/{id}")
    @RequirePermission(Permissions.ADMIN_APPROVAL_MANAGE)
    fun company(@PathVariable id: UUID, ctx: AccessContext, model: Model): String {
        val view = onboarding.company(id)
        val c = view.company
        model.addAttribute("c", CompanyRow(c.id, c.name, c.code, c.type, c.approvalStatus.name, c.approvalNote,
            view.members.size, view.pendingMembers, c.createdAt?.let(::date), null))
        model.addAttribute("members", view.members.sortedBy { it.fullName.lowercase() }.map {
            PersonRow(it.id, it.fullName, it.email, c.id, c.name, it.approvalStatus.name, it.approvalNote, it.isActive,
                date(it.audit.createdAt), it.id == ctx.userId)
        })
        model.addAttribute("canOpenUsers", ctx.has(Permissions.ADMIN_USER_MANAGE))

        if (ctx.has(Permissions.ADMIN_BILLING_MANAGE)) {
            model.addAttribute("showBilling", true)
            val subscription = billing.subscriptionFor(SubjectRef(SubjectType.ORGANIZATION, id))
            model.addAttribute("subscription", subscription?.let(AdminBillingPageController::row))
            model.addAttribute("planOptions", billing.plans().filter { it.isActive && it.suits(SubjectType.ORGANIZATION) }
                .map { Option(it.id.toString(), "${it.name} · ${it.monthlyPrice.display()} per month") })
        }
        return "admin/company"
    }

    @PostMapping("/admin/companies/{id}/decision")
    @RequirePermission(Permissions.ADMIN_APPROVAL_MANAGE)
    fun decideCompany(
        @PathVariable id: UUID,
        @RequestParam status: ApprovalStatus,
        @RequestParam(required = false) note: String?,
        @RequestParam(defaultValue = "false") includeMembers: Boolean,
        @RequestParam(required = false, name = "returnTo") back: String?,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        val view = onboarding.decideCompany(ctx, id, status, note, includeMembers)
        redirect.addFlashAttribute(Flash.SUCCESS, "${view.company.name} is now ${status.label().lowercase()}." +
            if (status == ApprovalStatus.APPROVED && view.pendingMembers > 0) " ${view.pendingMembers} of its people are still waiting." else "")
        return "redirect:" + returnTo(back, "/admin/companies/$id")
    }

    @PostMapping("/admin/people/{id}/decision")
    @RequirePermission(Permissions.ADMIN_APPROVAL_MANAGE)
    fun decidePerson(
        @PathVariable id: UUID,
        @RequestParam status: ApprovalStatus,
        @RequestParam(required = false) note: String?,
        @RequestParam(required = false, name = "returnTo") back: String?,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        val user = onboarding.decideUser(ctx, id, status, note)
        redirect.addFlashAttribute(Flash.SUCCESS, "${user.email} is now ${status.label().lowercase()}.")
        return "redirect:" + returnTo(back, "/admin/approvals?tab=$TAB_INDIVIDUALS")
    }

    private fun companyForm(model: Model, name: String, type: String, error: String?): String {
        model.addAttribute("name", name)
        model.addAttribute("type", type)
        model.addAttribute("types", OnboardingUseCase.COMPANY_TYPES)
        model.addAttribute("error", error)
        return "admin/company-new"
    }

    private fun companyRows(withStanding: Boolean): List<CompanyRow> {
        val standings = if (withStanding) {
            billing.subscriptions().filter { it.subscription.subject.type == SubjectType.ORGANIZATION }
                .associate { it.subscription.subject.id to it.standing.name }
        } else emptyMap()
        return onboarding.companies().map { (c, members) ->
            CompanyRow(c.id, c.name, c.code, c.type, c.approvalStatus.name, c.approvalNote, members.size,
                members.count { it.approvalStatus == ApprovalStatus.PENDING }, c.createdAt?.let(::date), standings[c.id])
        }
    }

    private fun personRows(ctx: AccessContext): List<PersonRow> {
        val companies = organizations.findAll().associate { it.id to it.name }
        return users.listAll().sortedByDescending { it.audit.createdAt }.map {
            PersonRow(it.id, it.fullName, it.email, it.organizationId, it.organizationId?.let(companies::get),
                it.approvalStatus.name, it.approvalNote, it.isActive, date(it.audit.createdAt), it.id == ctx.userId)
        }
    }

    private fun date(instant: java.time.Instant): String = DATE.format(instant.atZone(ZoneId.systemDefault()))

    private companion object {
        const val TAB_COMPANIES = "companies"
        const val TAB_INDIVIDUALS = "individuals"
        const val SHOW_PENDING = "pending"
        const val SHOW_ALL = "all"
        const val PENDING = "PENDING"
        val DATE: DateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy")
    }
}
