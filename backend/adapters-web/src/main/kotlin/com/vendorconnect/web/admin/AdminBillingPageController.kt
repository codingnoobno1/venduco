package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.usecase.account.BillingUseCase
import com.vendorconnect.application.usecase.account.BillingUseCase.SubscriptionView
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.account.PaymentMethod
import com.vendorconnect.domain.account.PlanAudience
import com.vendorconnect.domain.account.Standing
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.account.SubscriptionStatus
import com.vendorconnect.security.RequirePermission
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

/** Plans, subscriptions and recording of payments. */
@Controller
@RequestMapping("/admin/billing")
class AdminBillingPageController(
    private val billing: BillingUseCase,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserUseCase
) {

    data class SubscriptionRow(
        val id: UUID,
        val subject: String,
        val subjectKind: String,
        val subjectId: UUID,
        val isCompany: Boolean,
        val plan: String,
        val monthlyPrice: String,
        val standing: String,
        val status: String,
        val paidUntil: String?,
        val nextDueOn: String,
        val allowsAccess: Boolean
    )

    data class PlanRow(val id: UUID, val code: String, val name: String, val description: String?, val audience: String,
                       val price: String, val priceInput: String, val active: Boolean, val subscribers: Int)

    data class PaymentRow(val receivedOn: String, val subject: String, val subscriptionId: UUID, val amount: String,
                          val method: String, val reference: String?, val period: String, val note: String?, val recordedBy: String)

    data class Option(val value: String, val label: String)

    data class Quote(val months: Int, val amount: String)

    // ── Subscriptions ──

    @GetMapping
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun subscriptions(@RequestParam(required = false) show: String?, model: Model): String {
        val all = billing.subscriptions()
        val filter = show.blankToNull()?.takeIf { it in FILTERS } ?: FILTER_ALL
        model.addAttribute("rows", all.filter {
            when (filter) {
                FILTER_ATTENTION -> it.standing in NEEDS_PAYMENT
                FILTER_BLOCKED -> !it.standing.allowsAccess
                else -> true
            }
        }.map(::row))
        model.addAttribute("show", filter)
        model.addAttribute("total", all.size)
        model.addAttribute("attention", all.count { it.standing in NEEDS_PAYMENT })
        model.addAttribute("blocked", all.count { !it.standing.allowsAccess })
        model.addAttribute("recurring", billing.monthlyRecurring().values.joinToString(" + ") { it.display() }.ifEmpty { "—" })

        // Who can still be put on a plan: approved or pending companies, and people who are not in a company.
        val taken = all.mapTo(mutableSetOf()) { it.subscription.subject }
        val companies = organizations.findAll()
            .filter { it.approvalStatus != ApprovalStatus.REJECTED && SubjectRef(SubjectType.ORGANIZATION, it.id) !in taken }
            .map { Option("${SubjectType.ORGANIZATION}:${it.id}", "Company · ${it.name}") }
        val individuals = users.listAll()
            .filter { it.organizationId == null && it.approvalStatus != ApprovalStatus.REJECTED && SubjectRef(SubjectType.USER, it.id) !in taken }
            .sortedBy { it.fullName.lowercase() }
            .map { Option("${SubjectType.USER}:${it.id}", "Individual · ${it.fullName} <${it.email}>") }
        model.addAttribute("subjectOptions", companies + individuals)
        model.addAttribute("planOptions", billing.plans().filter { it.isActive }
            .map { Option(it.id.toString(), "${it.name} · ${it.monthlyPrice.display()} per month · ${audienceLabel(it.audience)}") })
        return "admin/billing"
    }

    @PostMapping("/subscriptions")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun subscribe(
        @RequestParam subject: String,
        @RequestParam planId: String,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        val parts = subject.split(':', limit = 2)
        val ref = runCatching { SubjectRef(SubjectType.valueOf(parts[0]), UUID.fromString(parts[1])) }
            .getOrElse { throw DomainException("Choose who the subscription is for.") }
        val view = billing.subscribe(ctx, ref, planId.toUuidOrNull() ?: throw DomainException("Choose a plan."))
        redirect.addFlashAttribute(Flash.SUCCESS,
            "${view.subjectName} is on ${view.plan.name}. " +
                if (view.standing.allowsAccess) "It is paid until ${view.subscription.paidUntil}." else "Access opens when a payment is recorded.")
        return "redirect:/admin/billing/subscriptions/${view.subscription.id}"
    }

    @GetMapping("/subscriptions/{id}")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun subscription(@PathVariable id: UUID, model: Model): String {
        val view = billing.subscription(id)
        val names = users.listAll().associate { it.id to it.email }
        model.addAttribute("s", row(view))
        model.addAttribute("startedOn", view.subscription.startedOn.toString())
        model.addAttribute("cancelled", view.subscription.status == SubscriptionStatus.CANCELLED)
        model.addAttribute("suspended", view.subscription.status == SubscriptionStatus.SUSPENDED)
        model.addAttribute("nextPeriodFrom", view.subscription.nextPeriodStart(LocalDate.now()).toString())
        model.addAttribute("quotes", QUOTE_MONTHS.map { Quote(it, billing.amountFor(id, it).display()) })
        model.addAttribute("monthlyInput", view.plan.monthlyPrice.amount.toPlainString())
        model.addAttribute("methods", PaymentMethod.entries.map { Option(it.name, it.label()) })
        model.addAttribute("today", LocalDate.now().toString())
        model.addAttribute("accountPending", accountPending(view.subscription.subject))
        model.addAttribute("planOptions", billing.plans().filter { it.isActive && it.suits(view.subscription.subject.type) }
            .map { Option(it.id.toString(), "${it.name} · ${it.monthlyPrice.display()} per month") })
        model.addAttribute("currentPlanId", view.plan.id.toString())
        model.addAttribute("subjectValue", "${view.subscription.subject.type}:${view.subscription.subject.id}")
        model.addAttribute("payments", billing.payments(id).map {
            PaymentRow(it.receivedOn.toString(), view.subjectName, id, it.amount.display(), it.method.label(), it.reference,
                "${it.periodFrom} to ${it.periodTo}", it.note, it.recordedBy?.let { by -> names[by] ?: by.toString() } ?: "system")
        })
        return "admin/subscription"
    }

    @PostMapping("/subscriptions/{id}/payments")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun recordPayment(
        @PathVariable id: UUID,
        @RequestParam months: Int,
        @RequestParam amount: String,
        @RequestParam method: PaymentMethod,
        @RequestParam(required = false) reference: String?,
        @RequestParam(required = false) receivedOn: String?,
        @RequestParam(required = false) note: String?,
        @RequestParam(defaultValue = "false") approveAccount: Boolean,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        val result = billing.recordPayment(
            ctx,
            BillingUseCase.RecordPaymentCommand(
                subscriptionId = id,
                months = months,
                amount = parseMoney(amount, "Amount") ?: throw DomainException("Enter the amount received."),
                method = method,
                reference = reference,
                receivedOn = receivedOn.toDateOrNull() ?: LocalDate.now(),
                note = note,
                approveAccount = approveAccount
            )
        )
        redirect.addFlashAttribute(Flash.SUCCESS,
            "Payment of ${result.payment.amount.display()} recorded. Paid until ${result.payment.periodTo}." +
                (if (result.accountApproved) " The account has been approved." else "") +
                (if (!result.subscription.standing.allowsAccess) " Access is still closed: the subscription is ${result.subscription.standing.label().lowercase()}." else ""))
        return "redirect:/admin/billing/subscriptions/$id"
    }

    @PostMapping("/subscriptions/{id}/status")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun setStatus(@PathVariable id: UUID, @RequestParam status: SubscriptionStatus, ctx: AccessContext, redirect: RedirectAttributes): String {
        val view = billing.setStatus(ctx, id, status)
        redirect.addFlashAttribute(Flash.SUCCESS, "Subscription is now ${view.subscription.status.label().lowercase()}.")
        return "redirect:/admin/billing/subscriptions/$id"
    }

    // ── Plans ──

    @GetMapping("/plans")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun plans(model: Model): String {
        val subscribers = billing.subscriptions().filter { it.subscription.status != SubscriptionStatus.CANCELLED }
            .groupingBy { it.plan.id }.eachCount()
        model.addAttribute("plans", billing.plans().map {
            PlanRow(it.id, it.code, it.name, it.description, audienceLabel(it.audience), it.monthlyPrice.display(),
                it.monthlyPrice.amount.toPlainString(), it.isActive, subscribers[it.id] ?: 0)
        })
        model.addAttribute("audiences", PlanAudience.entries.map { Option(it.name, audienceLabel(it)) })
        return "admin/plans"
    }

    @PostMapping("/plans")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun createPlan(
        @RequestParam code: String,
        @RequestParam name: String,
        @RequestParam(required = false) description: String?,
        @RequestParam audience: PlanAudience,
        @RequestParam price: String,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        val plan = billing.createPlan(ctx, code, name, description, audience,
            parseMoney(price, "Monthly price") ?: throw DomainException("Enter the monthly price."))
        redirect.addFlashAttribute(Flash.SUCCESS, "Plan ${plan.code} created.")
        return "redirect:/admin/billing/plans"
    }

    @PostMapping("/plans/{id}")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun updatePlan(
        @PathVariable id: UUID,
        @RequestParam name: String,
        @RequestParam(required = false) description: String?,
        @RequestParam price: String,
        @RequestParam(defaultValue = "false") active: Boolean,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        val plan = billing.updatePlan(ctx, id, name, description,
            parseMoney(price, "Monthly price") ?: throw DomainException("Enter the monthly price."), active)
        redirect.addFlashAttribute(Flash.SUCCESS, "Plan ${plan.code} saved. A new price applies to payments recorded from now on.")
        return "redirect:/admin/billing/plans"
    }

    // ── Ledger ──

    @GetMapping("/payments")
    @RequirePermission(Permissions.ADMIN_BILLING_MANAGE)
    fun payments(model: Model): String {
        val names = users.listAll().associate { it.id to it.email }
        model.addAttribute("rows", billing.recentPayments(LEDGER_SIZE).map { (p, subscription) ->
            PaymentRow(p.receivedOn.toString(), subscription?.subjectName ?: "(removed)", p.subscriptionId, p.amount.display(),
                p.method.label(), p.reference, "${p.periodFrom} to ${p.periodTo}", p.note,
                p.recordedBy?.let { names[it] ?: it.toString() } ?: "system")
        })
        model.addAttribute("limit", LEDGER_SIZE)
        return "admin/payments"
    }

    private fun accountPending(subject: SubjectRef): Boolean = when (subject.type) {
        SubjectType.ORGANIZATION -> organizations.findById(subject.id)?.approvalStatus == ApprovalStatus.PENDING
        SubjectType.USER -> runCatching { users.getById(subject.id).approvalStatus == ApprovalStatus.PENDING }.getOrDefault(false)
    }

    companion object {
        private const val FILTER_ALL = "all"
        private const val FILTER_ATTENTION = "attention"
        private const val FILTER_BLOCKED = "blocked"
        private val FILTERS = setOf(FILTER_ALL, FILTER_ATTENTION, FILTER_BLOCKED)
        private val NEEDS_PAYMENT = setOf(Standing.AWAITING_PAYMENT, Standing.GRACE, Standing.OVERDUE)
        private val QUOTE_MONTHS = listOf(1, 3, 6, 12)
        private const val LEDGER_SIZE = 200

        fun audienceLabel(audience: PlanAudience): String = when (audience) {
            PlanAudience.COMPANY -> "Companies"
            PlanAudience.INDIVIDUAL -> "Individuals"
            PlanAudience.ANY -> "Companies and individuals"
        }

        fun row(view: SubscriptionView): SubscriptionRow {
            val s = view.subscription
            return SubscriptionRow(
                id = s.id,
                subject = view.subjectName,
                subjectKind = if (s.subject.type == SubjectType.ORGANIZATION) "Company" else "Individual",
                subjectId = s.subject.id,
                isCompany = s.subject.type == SubjectType.ORGANIZATION,
                plan = view.plan.name,
                monthlyPrice = view.plan.monthlyPrice.display(),
                standing = view.standing.name,
                status = s.status.name,
                paidUntil = s.paidUntil?.toString(),
                nextDueOn = view.nextDueOn.toString(),
                allowsAccess = view.standing.allowsAccess
            )
        }
    }
}
