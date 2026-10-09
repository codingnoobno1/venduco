package com.vendorconnect.application.usecase.account

import com.vendorconnect.application.port.outbound.BillingRepositoryPort
import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.OrganizationRef
import com.vendorconnect.domain.shared.AccountNotApprovedException
import com.vendorconnect.domain.shared.PaymentRequiredException
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.account.Plan
import com.vendorconnect.domain.account.Standing
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.account.Subscription
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.domain.user.User
import com.vendorconnect.application.config.AppProperties
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

/**
 * Decides whether an account may use the platform right now: it has to be approved and, while
 * payment is enforced, a subscription it is on has to be paid.
 *
 * A person who belongs to a company is covered by the company: its approval and its subscription
 * are what count. A person without a company answers for themselves.
 */
@Service
class AccountStandingService(
    private val organizations: OrganizationDirectoryPort,
    private val billing: BillingRepositoryPort,
    private val platformSettings: PlatformSettingsService,
    properties: AppProperties
) {
    private val settings = properties.billing

    data class AccountSummary(
        val userApproval: ApprovalStatus,
        val organization: OrganizationRef?,
        val subject: SubjectRef,
        val subscription: Subscription?,
        val plan: Plan?,
        val standing: Standing?,
        /** What has to be paid now to regain or keep access; null when nothing is due. */
        val amountDue: Money?,
        val canUsePlatform: Boolean,
        val blockedReason: String?
    )

    fun subjectOf(user: User): SubjectRef =
        user.organizationId?.let { SubjectRef(SubjectType.ORGANIZATION, it) } ?: SubjectRef(SubjectType.USER, user.id)

    fun standingOf(subscription: Subscription, today: LocalDate = LocalDate.now()): Standing =
        subscription.standing(today, settings.graceDays)

    /**
     * @param platformStaff true when the caller acts under a platform-level role. Platform staff must
     *   themselves be approved, but are not tied to any company's approval or to billing; otherwise an
     *   unpaid invoice could lock out the very people who record payments.
     */
    @Transactional(readOnly = true)
    fun requireGoodStanding(user: User, platformStaff: Boolean) {
        refusal(user, platformStaff)?.let { throw it }
    }

    @Transactional(readOnly = true)
    fun summary(user: User): AccountSummary {
        val subject = subjectOf(user)
        val subscription = billing.findSubscriptionFor(subject)
        val plan = subscription?.let { billing.findPlan(it.planId) }
        val standing = subscription?.let { standingOf(it) }
        val refusal = refusal(user, platformStaff = false)
        return AccountSummary(
            userApproval = user.approvalStatus,
            organization = user.organizationId?.let(organizations::findById),
            subject = subject,
            subscription = subscription,
            plan = plan,
            standing = standing,
            amountDue = plan?.monthlyPrice?.takeIf { standing in setOf(Standing.AWAITING_PAYMENT, Standing.GRACE, Standing.OVERDUE) },
            canUsePlatform = refusal == null,
            blockedReason = refusal?.message
        )
    }

    private fun refusal(user: User, platformStaff: Boolean): RuntimeException? {
        if (user.approvalStatus != ApprovalStatus.APPROVED) {
            return AccountNotApprovedException(approvalMessage("Your account", user.approvalStatus))
        }
        if (platformStaff) return null

        user.organizationId?.let(organizations::findById)?.let { company ->
            if (company.approvalStatus != ApprovalStatus.APPROVED) {
                return AccountNotApprovedException(approvalMessage(company.name, company.approvalStatus))
            }
        }

        // Switched off in the console: subscriptions are still recorded, but not paying blocks nobody.
        if (!platformSettings.current().paymentEnforced) return null

        val subscription = billing.findSubscriptionFor(subjectOf(user))
        if (subscription == null) {
            return if (settings.requireSubscription) PaymentRequiredException("A subscription is required to use the platform.") else null
        }
        return when (standingOf(subscription)) {
            Standing.PAID, Standing.GRACE -> null
            Standing.AWAITING_PAYMENT -> PaymentRequiredException("Access opens once the first subscription payment is received.")
            Standing.OVERDUE -> PaymentRequiredException("The subscription payment is overdue. Access resumes when it is paid.")
            Standing.SUSPENDED -> PaymentRequiredException("The subscription has been suspended.")
            Standing.CANCELLED -> PaymentRequiredException("The subscription has been cancelled.")
        }
    }

    private fun approvalMessage(who: String, status: ApprovalStatus) = when (status) {
        ApprovalStatus.PENDING -> "$who is awaiting approval."
        ApprovalStatus.REJECTED -> "$who was not approved."
        ApprovalStatus.SUSPENDED -> "$who has been suspended."
        ApprovalStatus.APPROVED -> "$who is approved."
    }
}
