package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.account.Payment
import com.vendorconnect.domain.account.Plan
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.Subscription
import java.util.UUID

interface BillingRepositoryPort {
    fun savePlan(plan: Plan): Plan
    fun findPlan(id: UUID): Plan?
    fun findPlanByCode(code: String): Plan?
    fun findPlans(): List<Plan>

    fun saveSubscription(subscription: Subscription): Subscription
    fun findSubscription(id: UUID): Subscription?
    fun findSubscriptionFor(subject: SubjectRef): Subscription?
    fun findSubscriptions(): List<Subscription>

    /** Payments are only ever added. */
    fun addPayment(payment: Payment): Payment
    fun findPayments(subscriptionId: UUID): List<Payment>
    fun findRecentPayments(limit: Int): List<Payment>
}
