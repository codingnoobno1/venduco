package com.vendorconnect.bootstrap

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockHttpServletRequestDsl
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.request.RequestPostProcessor
import java.nio.file.Files
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * The server-rendered admin console: reachable only on its own port, signed in to with a form
 * and a server session, and changed only through CSRF-protected form posts.
 * The test profile sets `app.admin.port` to 18081.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminConsoleIntegrationTest(@Autowired private val mvc: MockMvc) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-admin-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val ADMIN_PORT = 18081
        const val API_PORT = 8080
        const val ADMIN_EMAIL = "admin@test.local"
        const val ADMIN_PASSWORD = "admin-test-password-123"
    }

    private fun onPort(port: Int) = RequestPostProcessor { it.apply { localPort = port; serverPort = port } }

    private fun MockHttpServletRequestDsl.adminPort() = with(onPort(ADMIN_PORT))

    private fun signIn(email: String, password: String) = mvc.post("/admin/login") {
        adminPort()
        with(csrf())
        param("email", email)
        param("password", password)
    }.andReturn()

    private fun adminSession(): MockHttpSession {
        val result = signIn(ADMIN_EMAIL, ADMIN_PASSWORD)
        assertEquals("/admin", result.response.redirectedUrl)
        return result.request.getSession(false) as MockHttpSession
    }

    @Test
    fun `the console answers only on the admin port and the API only on its own`() {
        mvc.get("/admin/login") { adminPort() }.andExpect {
            status { isOk() }
            content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
        }
        mvc.get("/admin/assets/admin.css") { adminPort() }.andExpect { status { isOk() } }
        mvc.get("/") { adminPort() }.andExpect { status { is3xxRedirection() }; redirectedUrl("/admin") }

        mvc.get("/admin/login") { with(onPort(API_PORT)) }.andExpect { status { isNotFound() } }
        mvc.get("/admin") { with(onPort(API_PORT)) }.andExpect { status { isNotFound() } }
        mvc.get("/api/v1/health") { adminPort() }.andExpect { status { isNotFound() } }
        mvc.get("/api/v1/health") { with(onPort(API_PORT)) }.andExpect { status { isOk() } }
    }

    @Test
    fun `pages need a console session, which only an administrator can get`() {
        mvc.get("/admin") { adminPort() }.andExpect { status { is3xxRedirection() }; redirectedUrlPattern("**/admin/login") }

        // A valid API token is not a console session.
        val apiLogin = mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$ADMIN_EMAIL","password":"$ADMIN_PASSWORD"}"""
        }.andReturn()
        mvc.get("/admin/users") {
            adminPort()
            cookie(assertNotNull(apiLogin.response.getCookie("vc_token")))
        }.andExpect { status { is3xxRedirection() } }

        // A non-administrator and a wrong password fail in exactly the same way.
        val email = "user-${UUID.randomUUID()}@test.local"
        mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","fullName":"Plain Vendor","password":"correct-horse"}"""
        }.andExpect { status { isOk() } }
        assertEquals("/admin/login?error", signIn(email, "correct-horse").response.redirectedUrl)
        assertEquals("/admin/login?error", signIn(ADMIN_EMAIL, "wrong-password").response.redirectedUrl)

        val session = adminSession()
        val page = mvc.get("/admin") { adminPort(); this.session = session }.andExpect { status { isOk() } }.andReturn()
        val html = page.response.contentAsString
        assertTrue("Overview" in html && ADMIN_EMAIL in html)
        assertFalse("<script" in html.lowercase(), "the console must not ship scripts")
        assertTrue("script-src 'none'" in page.response.getHeader("Content-Security-Policy").orEmpty())
    }

    @Test
    fun `every page renders for an administrator`() {
        val session = adminSession()
        listOf("/admin/users", "/admin/roles", "/admin/roles/new", "/admin/assignments", "/admin/assignments/new", "/admin/audit")
            .forEach { path ->
                mvc.get(path) { adminPort(); this.session = session }.andExpect { status { isOk() } }
            }

        // Detail pages, reached the way a person would: through the links on the list pages.
        fun firstLink(listPath: String, prefix: String): String {
            val html = mvc.get(listPath) { adminPort(); this.session = session }.andReturn().response.contentAsString
            return assertNotNull(Regex("href=\"($prefix/[0-9a-f-]{36})\"").find(html), "no $prefix link on $listPath").groupValues[1]
        }
        listOf(firstLink("/admin/users", "/admin/users"), firstLink("/admin/roles", "/admin/roles"),
            firstLink("/admin/assignments", "/admin/assignments")).forEach { path ->
            mvc.get(path) { adminPort(); this.session = session }.andExpect { status { isOk() } }
        }

        mvc.get("/admin/roles/${UUID.randomUUID()}") { adminPort(); this.session = session }.andExpect {
            status { isNotFound() }
            content { contentTypeCompatibleWith(MediaType.TEXT_HTML) }
        }
    }

    @Test
    fun `changes are form posts that need a CSRF token and report refusals on the page`() {
        val session = adminSession()
        val key = "CHIEF_MECH_${UUID.randomUUID().toString().take(6).uppercase()}"
        fun createRole(withToken: Boolean, permission: String) = mvc.post("/admin/roles") {
            adminPort()
            this.session = session
            if (withToken) with(csrf())
            param("key", key)
            param("name", "Chief Mechanical Engineer")
            param("portal", "BUYER")
            param("scopeLevel", "DISCIPLINE")
            param("permissions", "package:read", permission)
        }.andReturn()

        assertEquals(403, createRole(withToken = false, permission = "progress:read").response.status)

        // A refused form comes back filled in, with the reason.
        val refused = createRole(withToken = true, permission = "package:raed")
        assertEquals(200, refused.response.status)
        assertTrue("Unknown permission" in refused.response.contentAsString && key in refused.response.contentAsString)

        val created = createRole(withToken = true, permission = "progress:read")
        val rolePath = assertNotNull(created.response.redirectedUrl)
        assertTrue(rolePath.startsWith("/admin/roles/"), rolePath)
        val detail = mvc.get(rolePath) { adminPort(); this.session = session }.andExpect { status { isOk() } }.andReturn()
        assertTrue(key in detail.response.contentAsString)

        // A refused action on an existing record sends the user back with a message instead of an error page.
        val builtIn = Regex("href=\"(/admin/roles/[0-9a-f-]{36})\"").find(
            mvc.get("/admin/roles") { adminPort(); this.session = session }.andReturn().response.contentAsString
        )!!.groupValues[1]
        mvc.post("$builtIn/delete") {
            adminPort(); this.session = session; with(csrf())
            header("Referer", "http://localhost:$ADMIN_PORT$builtIn")
        }.andExpect { status { is3xxRedirection() }; redirectedUrl(builtIn); flash { attributeExists("flashError") } }

        // Signing out ends the session.
        mvc.post("/admin/logout") { adminPort(); this.session = session; with(csrf()) }
            .andExpect { status { is3xxRedirection() }; redirectedUrl("/admin/login?logout") }
        mvc.get("/admin/roles") { adminPort(); this.session = session }.andExpect { status { is3xxRedirection() } }
    }
}
