package com.vendorconnect.application.usecase.account

import com.vendorconnect.application.port.outbound.PlatformSettingsPort
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.application.config.AppProperties
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * The switches an administrator can flip from the console without a restart.
 *
 * Each starts at the value from application configuration and is overridden once somebody
 * changes it. They are read on every request, so the values are held in memory and re-read
 * from the database every few seconds; a change made on this instance applies at once.
 */
@Service
class PlatformSettingsService(
    private val store: PlatformSettingsPort,
    private val audit: AuditRecorder,
    properties: AppProperties
) {
    data class Settings(
        /** New registrations are approved immediately instead of waiting for an administrator. */
        val autoApproveRegistrations: Boolean,
        /** An account on a plan is refused access while its subscription is unpaid. Off: billing is recorded but blocks nobody. */
        val paymentEnforced: Boolean
    )

    private val defaults = Settings(
        autoApproveRegistrations = !properties.onboarding.requireApproval,
        paymentEnforced = properties.billing.enforce
    )

    @Volatile
    private var cached: Pair<Long, Settings>? = null

    fun current(): Settings {
        val now = System.currentTimeMillis()
        cached?.let { (loadedAt, settings) -> if (now - loadedAt < REFRESH_MILLIS) return settings }
        return load().also { cached = now to it }
    }

    @Transactional
    fun update(ctx: AccessContext, autoApproveRegistrations: Boolean, paymentEnforced: Boolean): Settings {
        val before = load()
        val after = Settings(autoApproveRegistrations, paymentEnforced)
        if (after.autoApproveRegistrations != before.autoApproveRegistrations) {
            store.put(AUTO_APPROVE, after.autoApproveRegistrations.toString(), ctx.userId)
            audit.record(ctx, "SETTING_CHANGED", ENTITY, AUTO_APPROVE,
                "Auto-approve new registrations: ${onOff(before.autoApproveRegistrations)} → ${onOff(after.autoApproveRegistrations)}")
        }
        if (after.paymentEnforced != before.paymentEnforced) {
            store.put(PAYMENT_ENFORCED, after.paymentEnforced.toString(), ctx.userId)
            audit.record(ctx, "SETTING_CHANGED", ENTITY, PAYMENT_ENFORCED,
                "Payment enforcement: ${onOff(before.paymentEnforced)} → ${onOff(after.paymentEnforced)}")
        }
        cached = System.currentTimeMillis() to after
        return after
    }

    private fun load(): Settings {
        val stored = store.findAll()
        return Settings(
            autoApproveRegistrations = stored[AUTO_APPROVE]?.toBooleanStrictOrNull() ?: defaults.autoApproveRegistrations,
            paymentEnforced = stored[PAYMENT_ENFORCED]?.toBooleanStrictOrNull() ?: defaults.paymentEnforced
        )
    }

    private fun onOff(value: Boolean) = if (value) "on" else "off"

    private companion object {
        const val ENTITY = "SETTING"
        const val AUTO_APPROVE = "onboarding.auto-approve"
        const val PAYMENT_ENFORCED = "billing.enforce"
        const val REFRESH_MILLIS = 5_000L
    }
}
