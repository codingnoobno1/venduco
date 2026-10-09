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
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.nio.file.Files
import java.util.UUID
import kotlin.test.assertNotNull

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectStructureIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {
    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-project-structure-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }
    }

    @Test
    fun `project detail and structure endpoints return persisted project data`() {
        val token = login()
        val headId = jdbc.queryForObject("SELECT id FROM users WHERE email = 'admin@test.local'", String::class.java)!!
        val organizationId = UUID.randomUUID().toString()
        val projectId = UUID.randomUUID().toString()
        val sectionId = UUID.randomUUID().toString()

        jdbc.update("INSERT INTO organizations (id, name, code, type) VALUES (?, 'Project Test Org', ?, 'GOVERNMENT_AUTHORITY')",
            organizationId, "PTO-${organizationId.take(8)}")
        jdbc.update(
            """INSERT INTO projects (id, name, corridor_name, organization_id, project_head_id, status, estimated_budget_minor, estimated_budget_currency)
               VALUES (?, 'Dynamic Test Project', 'DTP', ?, ?, 'IN_PROGRESS', 90000000, 'INR')""",
            projectId, organizationId, headId
        )
        jdbc.update(
            """INSERT INTO project_sections (id, project_id, name, start_latitude, start_longitude, start_label,
                   end_latitude, end_longitude, end_label, length_km)
               VALUES (?, ?, 'North Section', 28.1, 77.1, 'North', 28.2, 77.2, 'South', 12.5)""",
            sectionId, projectId
        )
        jdbc.update(
            """INSERT INTO corridor_packages (id, section_id, package_number, description, contractor_id, status, estimated_value_minor)
               VALUES (?, ?, 'DTP-101', 'Viaduct and track works', ?, 'DELAYED', 60000000)""",
            UUID.randomUUID().toString(), sectionId, organizationId
        )

        mvc.get("/api/v1/projects/$projectId") { cookie(token) }.andExpect {
            status { isOk() }
            jsonPath("$.name") { value("Dynamic Test Project") }
            // Real figures only: the owner, a progress derived from completed package value (none completed yet),
            // and no schedule fields while schedules are not tracked.
            jsonPath("$.clientName") { value("Project Test Org") }
            jsonPath("$.progress") { value(0) }
            jsonPath("$.riskLevel") { value("MEDIUM") }
            jsonPath("$.delayedPackageCount") { value(1) }
            jsonPath("$.plannedProgress") { doesNotExist() }
            jsonPath("$.deadline") { doesNotExist() }
            jsonPath("$.departments[0].workPackages[0].code") { value("DTP-101") }
        }
        mvc.get("/api/v1/projects/$projectId/members") { cookie(token) }.andExpect {
            status { isOk() }
            jsonPath("$") { isArray() }
        }

        // A vendor working alone has no project or company scope and no portfolio access, so the project is not visible.
        val vendor = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"vendor-${UUID.randomUUID()}@test.local","fullName":"Solo Vendor","password":"correct-horse"}"""
        }.andReturn().response.getCookie("vc_token")!!
        mvc.get("/api/v1/projects") { cookie(vendor) }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(0) }
        }
        mvc.get("/api/v1/projects/$projectId") { cookie(vendor) }.andExpect { status { isNotFound() } }
        mvc.get("/api/v1/projects/$projectId/sections") { cookie(token) }.andExpect {
            status { isOk() }
            jsonPath("$[0].sectionCode") { value("SEC-01") }
            jsonPath("$[0].chainageRange") { value("North – South") }
            jsonPath("$[0].status") { value("AT_RISK") }
        }
        mvc.get("/api/v1/projects/$projectId/work-packages") { cookie(token) }.andExpect {
            status { isOk() }
            jsonPath("$[0].packageCode") { value("DTP-101") }
            jsonPath("$[0].contractorName") { value("Project Test Org") }
        }
        mvc.get("/api/v1/projects/$projectId/corridor") { cookie(token) }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(5) }
            jsonPath("$[0].status") { value("AT_RISK") }
        }
        mvc.get("/api/v1/projects/$projectId/continuity-gaps") { cookie(token) }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].issue") { value("Delayed package: Viaduct and track works") }
        }
    }

    private fun login(): Cookie {
        val result = mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"admin@test.local","password":"admin-test-password-123"}"""
        }.andReturn()
        return assertNotNull(result.response.getCookie("vc_token"))
    }
}
