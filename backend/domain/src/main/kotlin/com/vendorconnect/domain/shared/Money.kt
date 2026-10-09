package com.vendorconnect.domain.shared

import com.vendorconnect.domain.shared.requireDomain
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.Currency

/**
 * Value object for monetary amounts.
 * Ensures type safety for financial calculations.
 *
 * The amount is normalised to the currency's minor-unit scale (2 for INR), so
 * `Money(1.0)` and `Money(1.00)` are equal and hash identically.
 */
class Money(
    amount: BigDecimal,
    val currency: Currency = INR
) {
    val amount: BigDecimal = amount.setScale(currency.defaultFractionDigits.coerceAtLeast(0), RoundingMode.HALF_EVEN)

    init {
        requireDomain(this.amount >= BigDecimal.ZERO) { "Money amount cannot be negative" }
    }

    operator fun plus(other: Money): Money {
        requireSameCurrency(other)
        return Money(amount + other.amount, currency)
    }

    operator fun minus(other: Money): Money {
        requireSameCurrency(other)
        requireDomain(amount >= other.amount) { "Cannot subtract $other from $this: result would be negative" }
        return Money(amount - other.amount, currency)
    }

    /** Amount in minor units (e.g. paise), as stored in the database. */
    fun toMinorUnits(): Long = amount.movePointRight(amount.scale()).longValueExact()

    fun formatted(): String = "$currency ${amount.toPlainString()}"

    override fun equals(other: Any?): Boolean =
        this === other || (other is Money && currency == other.currency && amount.compareTo(other.amount) == 0)

    override fun hashCode(): Int = 31 * amount.hashCode() + currency.hashCode()

    override fun toString(): String = formatted()

    private fun requireSameCurrency(other: Money) =
        requireDomain(currency == other.currency) { "Cannot combine $currency and ${other.currency}" }

    companion object {
        val INR: Currency = Currency.getInstance("INR")

        fun ofMinorUnits(minor: Long, currency: Currency = INR): Money =
            Money(BigDecimal.valueOf(minor, currency.defaultFractionDigits.coerceAtLeast(0)), currency)
    }
}
