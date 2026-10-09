package com.vendorconnect.persistence.jpa.jdbc

import com.vendorconnect.application.port.outbound.BillingRepositoryPort
import com.vendorconnect.domain.account.Payment
import com.vendorconnect.domain.account.PaymentMethod
import com.vendorconnect.domain.account.Plan
import com.vendorconnect.domain.account.PlanAudience
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.account.Subscription
import com.vendorconnect.domain.account.SubscriptionStatus
import com.vendorconnect.domain.shared.Money
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Component
import java.sql.ResultSet
import java.time.Instant
import java.time.LocalDate
import java.util.Currency
import java.util.UUID

/** Plans, subscriptions and the payment ledger. Dates are ISO text and money is minor units, as elsewhere. */
@Component
class BillingRepositoryAdapter(private val jdbc: JdbcTemplate) : BillingRepositoryPort {

    private val planMapper = RowMapper { rs, _ ->
        Plan(
            id = rs.uuid("id"),
            code = rs.getString("code"),
            name = rs.getString("name"),
            description = rs.getString("description"),
            audience = PlanAudience.valueOf(rs.getString("audience")),
            monthlyPrice = rs.money("monthly_price_minor", "currency"),
            isActive = rs.getInt("is_active") == 1,
            createdAt = Instant.parse(rs.getString("created_at")),
            updatedAt = Instant.parse(rs.getString("updated_at"))
        )
    }

    private val subscriptionMapper = RowMapper { rs, _ ->
        Subscription(
            id = rs.uuid("id"),
            subject = SubjectRef(SubjectType.valueOf(rs.getString("subject_type")), rs.uuid("subject_id")),
            planId = rs.uuid("plan_id"),
            status = SubscriptionStatus.valueOf(rs.getString("status")),
            startedOn = LocalDate.parse(rs.getString("started_on")),
            paidUntil = rs.getString("paid_until")?.let(LocalDate::parse),
            createdAt = Instant.parse(rs.getString("created_at")),
            updatedAt = Instant.parse(rs.getString("updated_at"))
        )
    }

    private val paymentMapper = RowMapper { rs, _ ->
        Payment(
            id = rs.uuid("id"),
            subscriptionId = rs.uuid("subscription_id"),
            amount = rs.money("amount_minor", "currency"),
            periodFrom = LocalDate.parse(rs.getString("period_from")),
            periodTo = LocalDate.parse(rs.getString("period_to")),
            method = PaymentMethod.valueOf(rs.getString("method")),
            reference = rs.getString("reference"),
            receivedOn = LocalDate.parse(rs.getString("received_on")),
            recordedBy = rs.getString("recorded_by")?.let(UUID::fromString),
            note = rs.getString("note"),
            createdAt = Instant.parse(rs.getString("created_at"))
        )
    }

    override fun savePlan(plan: Plan): Plan {
        jdbc.update(
            """INSERT INTO plans (id, code, name, description, audience, monthly_price_minor, currency, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description,
                   audience = excluded.audience, monthly_price_minor = excluded.monthly_price_minor,
                   currency = excluded.currency, is_active = excluded.is_active, updated_at = excluded.updated_at""",
            plan.id.toString(), plan.code, plan.name, plan.description, plan.audience.name, plan.monthlyPrice.toMinorUnits(),
            plan.monthlyPrice.currency.currencyCode, if (plan.isActive) 1 else 0, plan.createdAt.toString(), plan.updatedAt.toString()
        )
        return plan
    }

    override fun findPlan(id: UUID): Plan? =
        jdbc.query("SELECT * FROM plans WHERE id = ?", planMapper, id.toString()).firstOrNull()

    override fun findPlanByCode(code: String): Plan? =
        jdbc.query("SELECT * FROM plans WHERE code = ?", planMapper, code).firstOrNull()

    override fun findPlans(): List<Plan> =
        jdbc.query("SELECT * FROM plans ORDER BY is_active DESC, monthly_price_minor", planMapper)

    override fun saveSubscription(subscription: Subscription): Subscription {
        jdbc.update(
            """INSERT INTO subscriptions (id, subject_type, subject_id, plan_id, status, started_on, paid_until, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET plan_id = excluded.plan_id, status = excluded.status,
                   paid_until = excluded.paid_until, updated_at = excluded.updated_at""",
            subscription.id.toString(), subscription.subject.type.name, subscription.subject.id.toString(),
            subscription.planId.toString(), subscription.status.name, subscription.startedOn.toString(),
            subscription.paidUntil?.toString(), subscription.createdAt.toString(), subscription.updatedAt.toString()
        )
        return subscription
    }

    override fun findSubscription(id: UUID): Subscription? =
        jdbc.query("SELECT * FROM subscriptions WHERE id = ?", subscriptionMapper, id.toString()).firstOrNull()

    override fun findSubscriptionFor(subject: SubjectRef): Subscription? =
        jdbc.query(
            "SELECT * FROM subscriptions WHERE subject_type = ? AND subject_id = ?", subscriptionMapper,
            subject.type.name, subject.id.toString()
        ).firstOrNull()

    override fun findSubscriptions(): List<Subscription> =
        jdbc.query("SELECT * FROM subscriptions ORDER BY created_at DESC", subscriptionMapper)

    override fun addPayment(payment: Payment): Payment {
        jdbc.update(
            """INSERT INTO payments (id, subscription_id, amount_minor, currency, period_from, period_to, method, reference,
                                     received_on, recorded_by, note, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            payment.id.toString(), payment.subscriptionId.toString(), payment.amount.toMinorUnits(),
            payment.amount.currency.currencyCode, payment.periodFrom.toString(), payment.periodTo.toString(),
            payment.method.name, payment.reference, payment.receivedOn.toString(), payment.recordedBy?.toString(),
            payment.note, payment.createdAt.toString()
        )
        return payment
    }

    override fun findPayments(subscriptionId: UUID): List<Payment> =
        jdbc.query("SELECT * FROM payments WHERE subscription_id = ? ORDER BY created_at DESC", paymentMapper, subscriptionId.toString())

    override fun findRecentPayments(limit: Int): List<Payment> =
        jdbc.query("SELECT * FROM payments ORDER BY created_at DESC LIMIT ?", paymentMapper, limit)

    private fun ResultSet.uuid(column: String): UUID = UUID.fromString(getString(column))

    private fun ResultSet.money(amountColumn: String, currencyColumn: String): Money =
        Money.ofMinorUnits(getLong(amountColumn), Currency.getInstance(getString(currencyColumn)))
}
