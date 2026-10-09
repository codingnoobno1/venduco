package com.vendorconnect.domain.account

import com.vendorconnect.domain.shared.Money
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/** Whether a user or a company has been let onto the platform. Only [APPROVED] may use it. */
enum class ApprovalStatus { PENDING, APPROVED, REJECTED, SUSPENDED }

/** Who a subscription is for: a company (covering all its people) or one individual. */
enum class SubjectType { ORGANIZATION, USER }

data class SubjectRef(val type: SubjectType, val id: UUID)

enum class PlanAudience { COMPANY, INDIVIDUAL, ANY }

data class Plan(
    val id: UUID = UUID.randomUUID(),
    val code: String,
    val name: String,
    val description: String? = null,
    val audience: PlanAudience,
    val monthlyPrice: Money,
    val isActive: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
) {
    fun suits(subject: SubjectType): Boolean = when (audience) {
        PlanAudience.ANY -> true
        PlanAudience.COMPANY -> subject == SubjectType.ORGANIZATION
        PlanAudience.INDIVIDUAL -> subject == SubjectType.USER
    }
}

/** What an administrator has decided about a subscription. Whether it is paid is derived, see [Standing]. */
enum class SubscriptionStatus { ACTIVE, SUSPENDED, CANCELLED }

/** Where a subscription stands on a given day. Only [PAID] and [GRACE] let its subject use the platform. */
enum class Standing(val allowsAccess: Boolean) {
    PAID(true),
    GRACE(true),
    AWAITING_PAYMENT(false),
    OVERDUE(false),
    SUSPENDED(false),
    CANCELLED(false)
}

data class Subscription(
    val id: UUID = UUID.randomUUID(),
    val subject: SubjectRef,
    val planId: UUID,
    val status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
    val startedOn: LocalDate = LocalDate.now(),
    /** Last day covered by payments so far; null until the first payment. */
    val paidUntil: LocalDate? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
) {
    /** Derived on read, so a subscription falls overdue on the right day without a job having to run. */
    fun standing(today: LocalDate, graceDays: Int): Standing = when {
        status == SubscriptionStatus.CANCELLED -> Standing.CANCELLED
        status == SubscriptionStatus.SUSPENDED -> Standing.SUSPENDED
        paidUntil == null -> Standing.AWAITING_PAYMENT
        !today.isAfter(paidUntil) -> Standing.PAID
        !today.isAfter(paidUntil.plusDays(graceDays.toLong())) -> Standing.GRACE
        else -> Standing.OVERDUE
    }

    /**
     * First day the next payment covers. A payment made while still paid up extends the paid period;
     * one made after a lapse starts today, so nobody is charged for days they were locked out.
     */
    fun nextPeriodStart(today: LocalDate): LocalDate {
        val dayAfterPaid = paidUntil?.plusDays(1) ?: startedOn
        return if (dayAfterPaid.isBefore(today)) today else dayAfterPaid
    }
}

enum class PaymentMethod { BANK_TRANSFER, UPI, CARD, CHEQUE, CASH, ONLINE_GATEWAY, WAIVER }

data class Payment(
    val id: UUID = UUID.randomUUID(),
    val subscriptionId: UUID,
    val amount: Money,
    val periodFrom: LocalDate,
    val periodTo: LocalDate,
    val method: PaymentMethod,
    val reference: String?,
    val receivedOn: LocalDate,
    val recordedBy: UUID?,
    val note: String?,
    val createdAt: Instant = Instant.now()
)
