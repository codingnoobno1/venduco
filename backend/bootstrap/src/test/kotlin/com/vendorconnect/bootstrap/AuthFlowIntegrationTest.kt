package com.vendorconnect.bootstrap

import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.MvcResult
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import java.nio.file.Files
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull

/**
 * Boots the full application (Flyway + Hibernate schema validation + security) against a
 * throwaway SQLite file and exercises the auth flow end to end.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest(@Autowired private val mvc: MockMvc) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val ADMIN_EMAIL = "admin@test.local"
        const val ADMIN_PASSWORD = "admin-test-password-123"
    }

    private fun uniqueEmail() = "user-${UUID.randomUUID()}@test.local"

    private fun register(email: String, password: String = "correct-horse", extra: String = ""): MvcResult =
        mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","fullName":"Test User","password":"$password"$extra}"""
        }.andReturn()

    private fun login(email: String, password: String): MvcResult =
        mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","password":"$password"}"""
        }.andReturn()

    private fun MvcResult.cookie(name: String): Cookie = assertNotNull(response.getCookie(name), "missing cookie $name")

    private fun MvcResult.userId(): String = Regex("\"id\":\"([^\"]+)\"").find(response.contentAsString)!!.groupValues[1]

    @Test
    fun `database connection enforces foreign keys`(@Autowired jdbc: JdbcTemplate) {
        assertEquals(1, jdbc.queryForObject("PRAGMA foreign_keys", Int::class.java))
    }

    @Test
    fun `health endpoint is public and reports UP`() {
        mvc.get("/api/v1/health").andExpect {
            status { isOk() }
            jsonPath("$.status") { value("UP") }
        }
    }

    @Test
    fun `registration ignores a client-supplied role and creates a VENDOR`() {
        val result = register(uniqueEmail(), extra = ""","role":"ADMIN"""")
        assertEquals(200, result.response.status)
        assert(result.response.contentAsString.contains("\"role\":\"VENDOR\""))
    }

    @Test
    fun `login succeeds with correct password and sets access and refresh cookies`() {
        val email = uniqueEmail()
        register(email)
        val result = login(email.uppercase(), "correct-horse")  // email is case-insensitive
        assertEquals(200, result.response.status, result.response.contentAsString)
        result.cookie("vc_token")
        assertEquals("/api/v1/auth", result.cookie("vc_refresh").path)
    }

    @Test
    fun `unknown email and wrong password return the same 401`() {
        val email = uniqueEmail()
        register(email)
        val wrongPassword = login(email, "wrong-password")
        val unknownEmail = login(uniqueEmail(), "wrong-password")

        assertEquals(401, wrongPassword.response.status)
        assertEquals(401, unknownEmail.response.status)
        val message = Regex("\"message\":\"([^\"]+)\"")
        assertEquals(
            message.find(wrongPassword.response.contentAsString)!!.groupValues[1],
            message.find(unknownEmail.response.contentAsString)!!.groupValues[1]
        )
    }

    @Test
    fun `duplicate email in a different case is rejected with 409`() {
        val email = uniqueEmail()
        register(email)
        assertEquals(409, register(email.uppercase()).response.status)
    }

    @Test
    fun `invalid input returns 400 with field errors`() {
        mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"not-an-email","fullName":"","password":"short"}"""
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.code") { value("VAL_001") }
            jsonPath("$.fieldErrors.email") { exists() }
            jsonPath("$.fieldErrors.password") { exists() }
        }
    }

    @Test
    fun `malformed JSON returns 400, wrong method 405, unknown route 404 when authenticated`() {
        mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = "{bad"
        }.andExpect { status { isBadRequest() }; jsonPath("$.code") { value("VAL_002") } }

        mvc.get("/api/v1/auth/login").andExpect { status { isMethodNotAllowed() } }

        val token = login(ADMIN_EMAIL, ADMIN_PASSWORD).cookie("vc_token")
        mvc.get("/api/v1/does-not-exist") { cookie(token) }.andExpect { status { isNotFound() } }
    }

    @Test
    fun `protected endpoint returns 401 without a token`() {
        mvc.patch("/api/v1/admin/users/${UUID.randomUUID()}") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"role":"SUPERVISOR"}"""
        }.andExpect {
            status { isUnauthorized() }
            jsonPath("$.code") { value("AUTH_005") }
        }
    }

    @Test
    fun `vendor cannot use admin endpoint but admin can promote and deactivate`() {
        val email = uniqueEmail()
        val registered = register(email)
        val vendorToken = registered.cookie("vc_token")
        val userId = registered.userId()

        mvc.patch("/api/v1/admin/users/$userId") {
            cookie(vendorToken)
            contentType = MediaType.APPLICATION_JSON
            content = """{"role":"ADMIN"}"""
        }.andExpect { status { isForbidden() } }

        val adminToken = login(ADMIN_EMAIL, ADMIN_PASSWORD).cookie("vc_token")
        mvc.patch("/api/v1/admin/users/$userId") {
            cookie(adminToken)
            contentType = MediaType.APPLICATION_JSON
            content = """{"role":"SUPERVISOR"}"""
        }.andExpect {
            status { isOk() }
            jsonPath("$.role") { value("SUPERVISOR") }
        }

        // Deactivation blocks both login and refresh.
        val refreshCookie = login(email, "correct-horse").cookie("vc_refresh")
        mvc.patch("/api/v1/admin/users/$userId") {
            cookie(adminToken)
            contentType = MediaType.APPLICATION_JSON
            content = """{"active":false}"""
        }.andExpect { status { isOk() } }

        assertEquals(403, login(email, "correct-horse").response.status)
        mvc.post("/api/v1/auth/refresh") { cookie(refreshCookie) }.andExpect { status { isForbidden() } }
    }

    @Test
    fun `refresh issues new tokens and a refresh token is not accepted as an access token`() {
        val email = uniqueEmail()
        val refreshToken = register(email).cookie("vc_refresh").value

        val refreshed = mvc.post("/api/v1/auth/refresh") { cookie(Cookie("vc_refresh", refreshToken)) }.andReturn()
        assertEquals(200, refreshed.response.status)
        assertNotEquals("", refreshed.cookie("vc_token").value)

        mvc.patch("/api/v1/admin/users/${UUID.randomUUID()}") {
            cookie(Cookie("vc_token", refreshToken))
            contentType = MediaType.APPLICATION_JSON
            content = """{"role":"ADMIN"}"""
        }.andExpect { status { isUnauthorized() } }
    }
}
