package com.vendorconnect.application.usecase.account

import com.vendorconnect.application.port.outbound.BillingRepositoryPort
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.domain.shared.ConflictException
import com.vendorconnect.domain.shared.DuplicateEntityException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.account.Payment
import com.vendorconnect.domain.account.PaymentMethod
import com.vendorconnect.domain.account.Plan
import com.vendorconnect.domain.account.PlanAudience
import com.vendorconnect.domain.account.Standing
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.account.Subscription
import com.vendorconnect.domain.account.SubscriptionStatus
import com.vendorconnect.domain.shared.Money
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * Monthly plans, subscriptions and the payment ledger.
 * Callers hold `admin.billing:manage` (checked at the delivery layer).
 *
 * Payments are recorded here by a person who has confirmed the money arrived; nothing in this class
 * collects or moves money.
 */
@Service
class BillingUseCase(
    private val billing: BillingRepositoryPort,
    private val organizations: OrganizationDirectoryPort,
    private val users: UserRepositoryPort,
    private val standing: AccountStandingService,
    private val onboarding: OnboardingUseCase,
    private val audit: AuditRecorder
) {

    data class SubscriptionView(
        val subscription: Subscription,
        val plan: Plan,
        val subjectName: String,
        val standing: Standing,
        /** First day not yet paid for, i.e. when the next payment falls due. */
        val nextDueOn: LocalDate
    )

    data class PaymentView(val payment: Payment, val subscription: SubscriptionView?)

    data class RecordPaymentCommand(
        val subscriptionId: UUID,
        val months: Int,
        val amount: Money,
        val method: PaymentMethod,
        val reference: String?,
        val receivedOn: LocalDate,
        val note: String?,
        /** Approve the company or person if they are still pending: "approved when they pay". */
        val approveAccount: Boolean
    )

    data class PaymentResult(val payment: Payment, val subscription: SubscriptionView, val accountApproved: Boolean)

    // ── Plans ──

    @Transactional(readOnly = true)
    fun plans(): List<Plan> = billing.findPlans()

    @Transactional(readOnly = true)
    fun plan(id: UUID): Plan = billing.findPlan(id) ?: throw EntityNotFoundException("Plan", id)

    @Transactional
    fun createPlan(ctx: AccessContext, code: String, name: String, description: String?, audience: PlanAudience, monthlyPrice: Money): Plan {
        val key = code.trim().uppercase()
        requireDomain(PLAN_CODE.matches(key)) { "Plan code must be 2-30 characters: capital letters, digits, hyphens and underscores." }
        requireDomain(name.isNotBlank()) { "Give the plan a name." }
        if (billing.findPlanByCode(key) != null) throw DuplicateEntityException("Plan", "code", key)

        val plan = billing.savePlan(Plan(code = key, name = name.trim(), description = description?.trim()?.ifEmpty { null },
            audience = audience, monthlyPrice = monthlyPrice))
        audit.record(ctx, "PLAN_CREATED", PLAN, plan.id, "Created plan ${plan.code} at ${plan.monthlyPrice.formatted()} per month")
        return plan
    }

    /** A new price applies to payments recorded from now on; what was already paid is not touched. */
    @Transactional
    fun updatePlan(ctx: AccessContext, id: UUID, name: String, description: String?, monthlyPrice: Money, active: Boolean): Plan {
        val current = plan(id)
        requireDomain(name.isNotBlank()) { "Give the plan a name." }
        val saved = billing.savePlan(current.copy(name = name.trim(), description = description?.trim()?.ifEmpty { null },
            monthlyPrice = monthlyPrice, isActive = active, updatedAt = Instant.now()))
        audit.record(ctx, "PLAN_UPDATED", PLAN, id,
            "${saved.code}: price ${current.monthlyPrice.formatted()} → ${saved.monthlyPrice.formatted()}, active=${saved.isActive}")
        return saved
    }

    // ── Subscriptions ──

    @Transactional(readOnly = true)
    fun subscriptions(): List<SubscriptionView> {
        val plans = billing.findPlans().associateBy { it.id }
        val names = subjectNames()
        return billing.findSubscriptions().mapNotNull { s -> plans[s.planId]?.let { view(s, it, names[s.subject]) } }
    }

    @Transactional(readOnly = true)
    fun subscription(id: UUID): SubscriptionView = view(findSubscription(id))

    @Transactional(readOnly = true)
    fun subscriptionFor(subject: SubjectRef): SubscriptionView? = billing.findSubscriptionFor(subject)?.let(::view)

    /** Puts a company or an individual on a plan, or moves them to another one. A cancelled subscription is reopened. */
    @Transactional
    fun subscribe(ctx: AccessContext, subject: SubjectRef, planId: UUID): SubscriptionView {
        val plan = plan(planId)
        if (!plan.isActive) throw ConflictException("Plan ${plan.code} is no longer offered.")
        requireDomain(plan.suits(subject.type)) {
            "Plan ${plan.code} is for ${if (plan.audience == PlanAudience.COMPANY) "companies" else "individuals"}."
        }
        val name = requireSubject(subject)

        val existing = billing.findSubscriptionFor(subject)
        val saved = billing.saveSubscription(
            existing?.copy(planId = plan.id, status = SubscriptionStatus.ACTIVE, updatedAt = Instant.now())
                ?: Subscription(subject = subject, planId = plan.id)
        )
        audit.record(ctx, if (existing == null) "SUBSCRIPTION_STARTED" else "SUBSCRIPTION_PLAN_CHANGED", SUBSCRIPTION, saved.id,
            "$name on plan ${plan.code} (${plan.monthlyPrice.formatted()} per month)")
        return view(saved)
    }

    @Transactional
    fun setStatus(ctx: AccessContext, id: UUID, status: SubscriptionStatus): SubscriptionView {
        val current = findSubscription(id)
        if (current.status == status) return view(current)
        val saved = billing.saveSubscription(current.copy(status = status, updatedAt = Instant.now()))
        return view(saved).also {
            audit.record(ctx, "SUBSCRIPTION_${status.name}", SUBSCRIPTION, id, "${it.subjectName}: ${current.status} → $status")
        }
    }

    // ── Payments ──

    @Transactional(readOnly = true)
    fun payments(subscriptionId: UUID): List<Payment> = billing.findPayments(subscriptionId)

    @Transactional(readOnly = true)
    fun recentPayments(limit: Int): List<PaymentView> {
        val views = subscriptions().associateBy { it.subscription.id }
        return billing.findRecentPayments(limit).map { PaymentView(it, views[it.subscriptionId]) }
    }

    /** What [months] months cost on this subscription today. */
    @Transactional(readOnly = true)
    fun amountFor(subscriptionId: UUID, months: Int): Money = priceOf(subscription(subscriptionId).plan, months)

    @Transactional
    fun recordPayment(ctx: AccessContext, command: RecordPaymentCommand): PaymentResult {
        val current = findSubscription(command.subscriptionId)
        val plan = plan(current.planId)
        if (current.status == SubscriptionStatus.CANCELLED) throw ConflictException("This subscription is cancelled. Reopen it by assigning a plan first.")

        requireDomain(command.months in 1..MAX_MONTHS) { "Months must be between 1 and $MAX_MONTHS." }
        requireDomain(!command.receivedOn.isAfter(LocalDate.now())) { "The received date cannot be in the future." }
        requireDomain(command.amount.currency == plan.monthlyPrice.currency) { "The payment must be in ${plan.monthlyPrice.currency}." }
        val due = priceOf(plan, command.months)
        if (command.method == PaymentMethod.WAIVER) {
            requireDomain(command.amount.amount.signum() == 0) { "A waiver records no money; enter 0 as the amount." }
            requireDomain(!command.note.isNullOrBlank()) { "Say why the fee is being waived." }
        } else {
            requireDomain(command.amount.amount >= due.amount) {
                "${command.months} month(s) on ${plan.code} cost ${due.formatted()}; ${command.amount.formatted()} is not enough."
            }
            requireDomain(command.method == PaymentMethod.CASH || !command.reference.isNullOrBlank()) {
                "Enter the transaction reference so the payment can be traced."
            }
        }

        val from = current.nextPeriodStart(LocalDate.now())
        val to = from.plusMonths(command.months.toLong()).minusDays(1)
        val payment = billing.addPayment(
            Payment(
                subscriptionId = current.id,
                amount = command.amount,
                periodFrom = from,
                periodTo = to,
                method = command.method,
                reference = command.reference?.trim()?.ifEmpty { null },
                receivedOn = command.receivedOn,
                recordedBy = ctx.userId,
                note = command.note?.trim()?.ifEmpty { null }
            )
        )
        val saved = billing.saveSubscription(current.copy(paidUntil = to, updatedAt = Instant.now()))
        val result = view(saved)
        audit.record(ctx, "PAYMENT_RECORDED", SUBSCRIPTION, saved.id,
            "${result.subjectName}: ${command.amount.formatted()} by ${command.method} for $from to $to" +
                (payment.reference?.let { " (ref $it)" } ?: ""))

        val approved = command.approveAccount && onboarding.approveIfPending(ctx, saved.subject)
        return PaymentResult(payment, result, approved)
    }

    // ── Figures for the dashboard ──

    /** Monthly value of subscriptions that currently give access, per currency. */
    @Transactional(readOnly = true)
    fun monthlyRecurring(): Map<String, Money> = subscriptions().filter { it.standing.allowsAccess }
        .groupBy { it.plan.monthlyPrice.currency.currencyCode }
        .mapValues { (_, list) -> list.map { it.plan.monthlyPrice }.reduce(Money::plus) }

    private fun view(subscription: Subscription): SubscriptionView =
        view(subscription, plan(subscription.planId), subjectNames()[subscription.subject])

    private fun view(subscription: Subscription, plan: Plan, name: String?) = SubscriptionView(
        subscription = subscription,
        plan = plan,
        subjectName = name ?: "(removed ${subscription.subject.type.name.lowercase()})",
        standing = standing.standingOf(subscription),
        nextDueOn = subscription.paidUntil?.plusDays(1) ?: subscription.startedOn
    )

    private fun subjectNames(): Map<SubjectRef, String> =
        organizations.findAll().associate { SubjectRef(SubjectType.ORGANIZATION, it.id) to it.name } +
            users.findAll().associate { SubjectRef(SubjectType.USER, it.id) to "${it.fullName} <${it.email}>" }

    private fun requireSubject(subject: SubjectRef): String = when (subject.type) {
        SubjectType.ORGANIZATION -> organizations.findById(subject.id)?.name ?: throw EntityNotFoundException("Company", subject.id)
        SubjectType.USER -> {
            val user = users.findById(subject.id) ?: throw EntityNotFoundException("User", subject.id)
            // One bill per account: a company's people are covered by the company's subscription.
            requireDomain(user.organizationId == null) { "${user.email} belongs to a company; put the company on a plan instead." }
            user.email
        }
    }

    private fun findSubscription(id: UUID) = billing.findSubscription(id) ?: throw EntityNotFoundException("Subscription", id)

    private fun priceOf(plan: Plan, months: Int) = Money(plan.monthlyPrice.amount.multiply(BigDecimal(months)), plan.monthlyPrice.currency)

    private companion object {
        const val PLAN = "PLAN"
        const val SUBSCRIPTION = "SUBSCRIPTION"
        const val MAX_MONTHS = 24
        val PLAN_CODE = Regex("^[A-Z][A-Z0-9_-]{1,29}$")
    }
}
