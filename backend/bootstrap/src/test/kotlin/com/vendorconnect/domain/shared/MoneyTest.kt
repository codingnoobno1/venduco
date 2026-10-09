package com.vendorconnect.domain.shared

import com.vendorconnect.domain.shared.DomainException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigDecimal
import kotlin.test.assertEquals

class MoneyTest {

    @Test
    fun `amounts with different scales are equal and hash the same`() {
        val a = Money(BigDecimal("1.0"))
        val b = Money(BigDecimal("1.00"))
        assertEquals(a, b)
        assertEquals(a.hashCode(), b.hashCode())
    }

    @Test
    fun `formatting rounds instead of throwing on extra decimals`() {
        // HALF_EVEN (banker's rounding): ties go to the even digit.
        assertEquals("INR 1.00", Money(BigDecimal("1.005")).formatted())
        assertEquals("INR 1.02", Money(BigDecimal("1.015")).formatted())
    }

    @Test
    fun `minor units round-trip`() {
        val money = Money(BigDecimal("1234.56"))
        assertEquals(123456L, money.toMinorUnits())
        assertEquals(money, Money.ofMinorUnits(123456L))
    }

    @Test
    fun `negative amounts and negative subtraction results are domain errors`() {
        assertThrows<DomainException> { Money(BigDecimal("-1")) }
        assertThrows<DomainException> { Money(BigDecimal("1")) - Money(BigDecimal("2")) }
    }
}
