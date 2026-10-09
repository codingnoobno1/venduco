package com.vendorconnect.bootstrap

import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.request.RequestPostProcessor
import java.nio.file.Files
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * The two console switches, starting from the shipped defaults: every new account is approved
 * automatically, and payment is not enforced. Both can be flipped at runtime from Settings.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlatformSettingsIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-settings-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val ADMIN_PORT = 18081
    }

    private data class Registered(val id: String, val token: Cookie)

    private val adminPort = RequestPostProcessor { it.apply { localPort = ADMIN_PORT; serverPort = ADMIN_PORT } }

    private val session: MockHttpSession by lazy {
        mvc.post("/admin/login") {
            with(adminPort); with(csrf())
            param("email", "admin@test.local"); param("password", "admin-test-password-123")
        }.andReturn().request.getSession(false) as MockHttpSession
    }

    private fun register(companyName: String? = null): Registered {
        val company = companyName?.let { ""","companyName":"$it"""" }.orEmpty()
        val result = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"user-${UUID.randomUUID()}@test.local","fullName":"Test Person","password":"correct-horse"$company}"""
        }.andReturn()
        assertEquals(200, result.response.status, result.response.contentAsString)
        return Registered(Regex("\"id\":\"([^\"]+)\"").find(result.response.contentAsString)!!.groupValues[1],
            assertNotNull(result.response.getCookie("vc_token")))
    }

    private fun access(user: Registered): Pair<Int, String?> {
        val result = mvc.get("/api/v1/projects") { cookie(user.token) }.andReturn()
        return result.response.status to Regex("\"code\":\"([^\"]+)\"").find(result.response.contentAsString)?.groupValues?.get(1)
    }

    private fun adminPost(path: String, vararg params: Pair<String, String>) = mvc.post(path) {
        with(adminPort); with(csrf())
        this.session = this@PlatformSettingsIntegrationTest.session
        params.forEach { (name, value) -> param(name, value) }
    }.andExpect { status { is3xxRedirection() } }.andReturn().also {
        assertNull(it.flashMap["flashError"], "refused: ${it.flashMap["flashError"]}")
    }

    private fun settingsPage(): String =
        mvc.get("/admin/settings") { with(adminPort); this.session = this@PlatformSettingsIntegrationTest.session }
            .andExpect { status { isOk() } }.andReturn().response.contentAsString

    @Test
    fun `by default everyone is approved automatically and payment blocks nobody, and both can be switched`() {
        // ── Shipped defaults ──
        settingsPage().let {
            assertTrue("Automatic approval on" in it && "Not enforced" in it, "defaults should be: auto-approve on, payment off")
        }
        val founder = register(companyName = "Default Settings Infra")
        assertEquals(200 to null, access(founder))

        // On a plan and unpaid, yet not blocked, because payment is not enforced.
        val companyId = jdbc.queryForObject("SELECT organization_id FROM users WHERE id = ?", String::class.java, founder.id)!!
        adminPost("/admin/billing/plans", "code" to "STD", "name" to "Standard", "audience" to "COMPANY", "price" to "5000")
        val planId = jdbc.queryForObject("SELECT id FROM plans WHERE code = 'STD'", String::class.java)!!
        adminPost("/admin/billing/subscriptions", "subject" to "ORGANIZATION:$companyId", "planId" to planId)
        assertEquals(200 to null, access(founder))
        mvc.get("/api/v1/me/account") { cookie(founder.token) }.andExpect {
            jsonPath("$.subscriptionStanding") { value("AWAITING_PAYMENT") }
            jsonPath("$.canUsePlatform") { value(true) }
        }
        assertTrue("would close access for <span>1</span>" in settingsPage())

        // ── Payment switched on: the unpaid subscription now blocks ──
        adminPost("/admin/settings", "autoApproveRegistrations" to "true", "paymentEnforced" to "true")
        assertEquals(402 to "AUTH_009", access(founder))

        // ── Payment off again, automatic approval off: new registrations wait ──
        adminPost("/admin/settings")  // both boxes unticked
        assertEquals(200 to null, access(founder))
        val waiting = register()
        assertEquals(403 to "AUTH_008", access(waiting))
        assertTrue("Manual approval" in settingsPage() && "waiting for approval right now" in settingsPage())

        // Switching automatic approval back on does not, by itself, let in those already waiting...
        adminPost("/admin/settings", "autoApproveRegistrations" to "true")
        assertEquals(403 to "AUTH_008", access(waiting))
        // ...unless asked to, and from then on new registrations go straight through.
        adminPost("/admin/settings", "autoApproveRegistrations" to "true", "approveWaiting" to "true")
        assertEquals(200 to null, access(waiting))
        assertEquals(200 to null, access(register()))

        // The choices survive a restart: they are stored, and every change is in the audit log.
        assertEquals("true", jdbc.queryForObject("SELECT setting_value FROM platform_settings WHERE setting_key = 'onboarding.auto-approve'", String::class.java))
        assertEquals("false", jdbc.queryForObject("SELECT setting_value FROM platform_settings WHERE setting_key = 'billing.enforce'", String::class.java))
        assertTrue(jdbc.queryForObject("SELECT count(*) FROM audit_log WHERE action = 'SETTING_CHANGED'", Int::class.java)!! >= 4)
    }

    @Test
    fun `the settings page is closed to anyone without the settings permission`() {
        val vendor = register()
        mvc.get("/admin/settings") { with(adminPort) }.andExpect { status { is3xxRedirection() } }  // no console session
        mvc.get("/api/v1/admin/roles") { cookie(vendor.token) }.andExpect { status { isForbidden() } }
    }
}
