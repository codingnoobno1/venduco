package com.vendorconnect.security

import org.junit.jupiter.api.Test
import org.springframework.web.method.HandlerMethod
import kotlin.test.assertEquals
import kotlin.test.assertNull

class EndpointAccessTest {

    @Suppress("unused")
    private class Sample {
        @RequirePermission("project:read") fun protectedMethod() = Unit
        @Authenticated fun signedIn() = Unit
        @PublicEndpoint fun open() = Unit
        fun undeclared() = Unit
        @Authenticated @RequirePermission("project:read") fun contradictory() = Unit
    }

    private fun accessOf(method: String) = EndpointAccess.of(HandlerMethod(Sample(), method))

    @Test
    fun `each declaration maps to its access rule`() {
        assertEquals(EndpointAccess.Permission("project:read"), accessOf("protectedMethod"))
        assertEquals(EndpointAccess.SignedIn, accessOf("signedIn"))
        assertEquals(EndpointAccess.Public, accessOf("open"))
    }

    @Test
    fun `a method with no declaration, or more than one, has no access rule and is therefore refused`() {
        assertNull(accessOf("undeclared"))
        assertNull(accessOf("contradictory"))
    }
}
