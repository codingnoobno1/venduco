package com.vendorconnect.bootstrap

import com.vendorconnect.application.usecase.account.OnboardingUseCase
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
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
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/** The console's delivery pages: projects with their sections and packages, tenders, the fleet register and system status. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminDeliveryIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-admin-delivery-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val ADMIN_PORT = 18081
        const val ADMIN_EMAIL = "admin@test.local"
        const val ADMIN_PASSWORD = "admin-test-password-123"
    }

    private fun MockHttpServletRequestDsl.adminPort() =
        with(RequestPostProcessor { it.apply { localPort = ADMIN_PORT; serverPort = ADMIN_PORT } })

    private fun adminSession(): MockHttpSession {
        val result = mvc.post("/admin/login") {
            adminPort()
            with(csrf())
            param("email", ADMIN_EMAIL)
            param("password", ADMIN_PASSWORD)
        }.andReturn()
        assertEquals("/admin", result.response.redirectedUrl)
        return result.request.getSession(false) as MockHttpSession
    }

    private fun page(session: MockHttpSession, path: String): String =
        mvc.get(path) { adminPort(); this.session = session }.andExpect { status { isOk() } }.andReturn().response.contentAsString

    private fun postForm(session: MockHttpSession, path: String, vararg params: Pair<String, String>) =
        mvc.post(path) {
            adminPort()
            this.session = session
            with(csrf())
            params.forEach { (k, v) -> param(k, v) }
        }.andReturn()

    private fun newCompany(session: MockHttpSession, name: String): UUID {
        val result = postForm(session, "/admin/companies", "name" to name, "type" to OnboardingUseCase.COMPANY_TYPES.first())
        val location = assertNotNull(result.response.redirectedUrl, "company creation should redirect")
        return UUID.fromString(location.substringAfterLast('/'))
    }

    private fun adminUserId(): String =
        jdbc.queryForObject("SELECT id FROM users WHERE email = ?", String::class.java, ADMIN_EMAIL)!!

    @Test
    fun `the delivery pages render, empty or not`() {
        val session = adminSession()
        listOf("/admin/projects", "/admin/projects/new", "/admin/tenders", "/admin/fleet", "/admin/fleet?attention=true", "/admin/system",
            "/admin/audit?entityType=PROJECT")
            .forEach { path -> assertTrue("VendorConnect" in page(session, path), path) }

        val nav = page(session, "/admin")
        assertTrue("/admin/projects" in nav && "/admin/tenders" in nav && "/admin/fleet" in nav && "/admin/system" in nav)
        assertTrue("Delayed work packages" in nav && "Tenders open for bidding" in nav)
        assertTrue("Answering" in page(session, "/admin/system"))

        mvc.get("/admin/projects/${UUID.randomUUID()}") { adminPort(); this.session = session }.andExpect { status { isNotFound() } }
        mvc.get("/admin/tenders/${UUID.randomUUID()}") { adminPort(); this.session = session }.andExpect { status { isNotFound() } }
    }

    @Test
    fun `an administrator builds a project with sections and packages, and every change is in its history`() {
        val session = adminSession()
        val owner = newCompany(session, "Meridian Infra ${UUID.randomUUID().toString().take(6)}")
        val contractor = newCompany(session, "Apex Earthworks ${UUID.randomUUID().toString().take(6)}")
        val name = "Metro Corridor ${UUID.randomUUID().toString().take(6)}"

        // A form with a missing budget comes back with the reason and the typed values.
        val rejected = mvc.post("/admin/projects") {
            adminPort(); this.session = session; with(csrf())
            param("name", name); param("corridorName", "Delhi – New Delhi")
            param("organizationId", owner.toString()); param("projectHeadId", adminUserId()); param("budget", "")
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue("Enter the estimated budget." in rejected && name in rejected)

        val created = postForm(session, "/admin/projects",
            "name" to name, "corridorName" to "Delhi – New Delhi", "organizationId" to owner.toString(),
            "projectHeadId" to adminUserId(), "budget" to "48500000000", "status" to "PLANNING")
        val projectPath = assertNotNull(created.response.redirectedUrl)
        val projectId = projectPath.substringAfterLast('/')
        assertTrue(name in page(session, "/admin/projects"))

        postForm(session, "$projectPath/sections",
            "name" to "Pier P-200 to P-260", "startLabel" to "12+400", "endLabel" to "14+200",
            "startLatitude" to "28.6139", "startLongitude" to "77.2090", "endLatitude" to "28.6300", "endLongitude" to "77.2200",
            "lengthKm" to "1.8")
        val sectionId = jdbc.queryForObject("SELECT id FROM project_sections WHERE project_id = ?", String::class.java, projectId)!!

        postForm(session, "$projectPath/packages",
            "sectionId" to sectionId, "packageNumber" to "civ-04", "description" to "Viaduct construction",
            "status" to "NOT_STARTED", "value" to "7200000000", "contractorId" to "")
        // The same number twice on one project is refused, with the reason flashed back.
        val duplicate = postForm(session, "$projectPath/packages",
            "sectionId" to sectionId, "packageNumber" to "CIV-04", "description" to "Again", "status" to "NOT_STARTED", "value" to "1")
        assertTrue(duplicate.flashMap["flashError"].toString().contains("already exists"))

        val packageId = jdbc.queryForObject("SELECT id FROM corridor_packages WHERE section_id = ?", String::class.java, sectionId)!!
        postForm(session, "$projectPath/packages/$packageId",
            "status" to "IN_PROGRESS", "contractorId" to contractor.toString(), "value" to "7350000000")
        assertEquals("IN_PROGRESS", jdbc.queryForObject("SELECT status FROM corridor_packages WHERE id = ?", String::class.java, packageId))

        postForm(session, projectPath,
            "name" to name, "corridorName" to "Delhi – New Delhi", "organizationId" to owner.toString(),
            "projectHeadId" to adminUserId(), "budget" to "48500000000", "status" to "IN_PROGRESS")

        val detail = page(session, projectPath)
        assertTrue("CIV-04" in detail && "Pier P-200 to P-260" in detail && "Apex Earthworks" in detail)
        listOf("Created project", "added section", "Added package CIV-04", "status NOT_STARTED → IN_PROGRESS", "status PLANNING → IN_PROGRESS")
            .forEach { assertTrue(it in detail, "history should show: $it") }
    }
}
