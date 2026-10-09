package com.vendorconnect.bootstrap

import com.vendorconnect.domain.access.SystemRoles
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
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.nio.file.Files
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * Exercises the access model end to end: permissions come from role assignments in the database,
 * every endpoint declares what it needs, and administration of roles and assignments is guarded.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AccessControlIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-access-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val ADMIN_EMAIL = "admin@test.local"
        const val ADMIN_PASSWORD = "admin-test-password-123"
        const val HEADER = "X-VC-Assignment"
    }

    private data class Account(val id: String, val token: Cookie)

    private fun MvcResult.field(name: String): String =
        assertNotNull(Regex("\"$name\":\"([^\"]+)\"").find(response.contentAsString), "no $name in ${response.contentAsString}").groupValues[1]

    private fun registerVendor(): Account {
        val result = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"user-${UUID.randomUUID()}@test.local","fullName":"Test User","password":"correct-horse"}"""
        }.andReturn()
        assertEquals(200, result.response.status, result.response.contentAsString)
        return Account(result.field("id"), assertNotNull(result.response.getCookie("vc_token")))
    }

    private fun admin(): Account {
        val result = mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$ADMIN_EMAIL","password":"$ADMIN_PASSWORD"}"""
        }.andReturn()
        return Account(result.field("id"), assertNotNull(result.response.getCookie("vc_token")))
    }

    private fun createProject(headUserId: String): Pair<String, String> {
        val orgId = UUID.randomUUID().toString()
        val projectId = UUID.randomUUID().toString()
        jdbc.update("INSERT INTO organizations (id, name, code, type) VALUES (?, ?, ?, 'GOVERNMENT_AUTHORITY')",
            orgId, "Test Org", "ORG-${orgId.take(8)}")
        jdbc.update(
            """INSERT INTO projects (id, name, corridor_name, organization_id, project_head_id, status, estimated_budget_minor, estimated_budget_currency)
               VALUES (?, 'Test Corridor', 'TC', ?, ?, 'IN_PROGRESS', 100000, 'INR')""",
            projectId, orgId, headUserId
        )
        return orgId to projectId
    }

    private fun assign(admin: Account, body: String): MvcResult =
        mvc.post("/api/v1/admin/assignments") {
            cookie(admin.token)
            contentType = MediaType.APPLICATION_JSON
            content = body
        }.andReturn()

    @Test
    fun `system roles are seeded and the bootstrap admin holds the platform admin role`() {
        val admin = admin()
        mvc.get("/api/v1/me/access") { cookie(admin.token) }.andExpect {
            status { isOk() }
            jsonPath("$.role.key") { value(SystemRoles.PLATFORM_ADMIN) }
            jsonPath("$.permissions") { isArray() }
        }
        mvc.get("/api/v1/admin/roles") { cookie(admin.token) }.andExpect {
            status { isOk() }
            jsonPath("$[?(@.key == 'HIRING_MANAGER')].system") { value(true) }
        }
    }

    @Test
    fun `a vendor cannot list users or change another account, an admin can`() {
        val vendor = registerVendor()
        val victim = registerVendor()

        mvc.get("/api/v1/users") { cookie(vendor.token) }.andExpect {
            status { isForbidden() }
            jsonPath("$.code") { value("AUTH_003") }
        }
        mvc.post("/api/v1/users/${victim.id}/deactivate") { cookie(vendor.token) }.andExpect { status { isForbidden() } }
        mvc.get("/api/v1/tenders") { cookie(vendor.token) }.andExpect { status { isForbidden() } }
        mvc.get("/api/v1/admin/roles") { cookie(vendor.token) }.andExpect { status { isForbidden() } }
        mvc.get("/api/v1/admin/audit") { cookie(vendor.token) }.andExpect { status { isForbidden() } }

        // Vendors keep read access to projects, as before.
        mvc.get("/api/v1/projects") { cookie(vendor.token) }.andExpect { status { isOk() } }

        val admin = admin()
        mvc.get("/api/v1/users") { cookie(admin.token) }.andExpect { status { isOk() } }
        mvc.post("/api/v1/users/${victim.id}/deactivate") { cookie(admin.token) }.andExpect {
            status { isOk() }
            jsonPath("$.isActive") { value(false) }
        }
    }

    @Test
    fun `a new user gets a default assignment that mirrors the legacy role and follows it when it changes`() {
        val vendor = registerVendor()

        val context = mvc.get("/api/v1/me/context") { cookie(vendor.token) }.andExpect {
            status { isOk() }
            jsonPath("$.assignments.length()") { value(1) }
            jsonPath("$.assignments[0].role.key") { value(SystemRoles.VENDOR) }
            jsonPath("$.assignments[0].usable") { value(true) }
        }.andReturn()
        assertEquals(context.field("defaultAssignmentId"), context.field("assignmentId"))

        mvc.patch("/api/v1/admin/users/${vendor.id}") {
            cookie(admin().token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"role":"SUPERVISOR"}"""
        }.andExpect { status { isOk() } }

        // Same access token: permissions are read from the database, not from the token.
        mvc.get("/api/v1/me/access") { cookie(vendor.token) }.andExpect {
            status { isOk() }
            jsonPath("$.role.key") { value(SystemRoles.SUPERVISOR) }
        }
        mvc.get("/api/v1/me/context") { cookie(vendor.token) }.andExpect {
            jsonPath("$.assignments.length()") { value(1) }
        }
    }

    @Test
    fun `a deactivated user is refused on protected endpoints even with a still-valid access token`() {
        val vendor = registerVendor()
        mvc.get("/api/v1/projects") { cookie(vendor.token) }.andExpect { status { isOk() } }

        mvc.patch("/api/v1/admin/users/${vendor.id}") {
            cookie(admin().token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"active":false}"""
        }.andExpect { status { isOk() } }

        mvc.get("/api/v1/projects") { cookie(vendor.token) }.andExpect {
            status { isForbidden() }
            jsonPath("$.code") { value("AUTH_004") }
        }
    }

    @Test
    fun `an assignment header that is malformed or belongs to someone else is refused`() {
        val vendor = registerVendor()
        val other = registerVendor()
        val othersAssignment = mvc.get("/api/v1/me/context") { cookie(other.token) }.andReturn().field("defaultAssignmentId")

        listOf("not-a-uuid", UUID.randomUUID().toString(), othersAssignment).forEach { value ->
            mvc.get("/api/v1/projects") {
                cookie(vendor.token)
                header(HEADER, value)
            }.andExpect {
                status { isForbidden() }
                jsonPath("$.code") { value("AUTH_007") }
            }
        }
    }

    @Test
    fun `a scoped assignment grants its role only when selected, capped by access level and validity`() {
        val admin = admin()
        val user = registerVendor()
        val (_, projectId) = createProject(user.id)
        val pmRole = SystemRoles.idOf(SystemRoles.PROJECT_MANAGER)

        val full = assign(admin, """{"userId":"${user.id}","roleId":"$pmRole","projectId":"$projectId",
            "approvalLimit":{"amountMinor":500000000,"currency":"INR"}}""")
        assertEquals(201, full.response.status, full.response.contentAsString)
        val fullId = full.field("id")

        // Without the header the user is still acting under their default (vendor) assignment.
        mvc.get("/api/v1/tenders") { cookie(user.token) }.andExpect { status { isForbidden() } }
        mvc.get("/api/v1/tenders") { cookie(user.token); header(HEADER, fullId) }.andExpect { status { isOk() } }
        mvc.get("/api/v1/me/access") { cookie(user.token); header(HEADER, fullId) }.andExpect {
            jsonPath("$.role.key") { value(SystemRoles.PROJECT_MANAGER) }
            jsonPath("$.projectId") { value(projectId) }
            jsonPath("$.approvalLimit.amountMinor") { value(500000000) }
            jsonPath("$.permissions[?(@ == 'tender:manage')]") { isNotEmpty() }
        }

        // READ level keeps the read permissions of the role and drops the rest.
        val readOnly = assign(admin, """{"userId":"${user.id}","roleId":"$pmRole","projectId":"$projectId","accessLevel":"READ"}""").field("id")
        mvc.get("/api/v1/tenders") { cookie(user.token); header(HEADER, readOnly) }.andExpect { status { isOk() } }
        mvc.post("/api/v1/tenders") {
            cookie(user.token); header(HEADER, readOnly)
            contentType = MediaType.APPLICATION_JSON
            content = "{}"
        }.andExpect { status { isForbidden() }; jsonPath("$.code") { value("AUTH_003") } }

        // An assignment whose end date has passed stops working without anyone revoking it.
        val today = LocalDate.now()
        val expired = assign(admin, """{"userId":"${user.id}","roleId":"$pmRole","projectId":"$projectId",
            "validFrom":"${today.minusDays(10)}","validUntil":"${today.minusDays(1)}"}""").field("id")
        mvc.get("/api/v1/tenders") { cookie(user.token); header(HEADER, expired) }.andExpect {
            status { isForbidden() }
            jsonPath("$.code") { value("AUTH_007") }
        }

        // Suspending and revoking take effect on the next request.
        mvc.patch("/api/v1/admin/assignments/$fullId") {
            cookie(admin.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"suspended":true}"""
        }.andExpect { status { isOk() }; jsonPath("$.usable") { value(false) } }
        mvc.get("/api/v1/tenders") { cookie(user.token); header(HEADER, fullId) }.andExpect { status { isForbidden() } }

        mvc.delete("/api/v1/admin/assignments/$readOnly") { cookie(admin.token) }.andExpect { status { isNoContent() } }
        mvc.get("/api/v1/tenders") { cookie(user.token); header(HEADER, readOnly) }.andExpect { status { isForbidden() } }

        mvc.get("/api/v1/admin/audit?entityType=ROLE_ASSIGNMENT&entityId=$fullId") { cookie(admin.token) }.andExpect {
            status { isOk() }
            jsonPath("$[?(@.action == 'ASSIGNMENT_CREATED')]") { isNotEmpty() }
            jsonPath("$[?(@.action == 'ASSIGNMENT_UPDATED')]") { isNotEmpty() }
        }
    }

    @Test
    fun `an assignment must match the scope level of its role`() {
        val admin = admin()
        val user = registerVendor()
        val (orgId, projectId) = createProject(user.id)
        val chief = SystemRoles.idOf(SystemRoles.CHIEF_ENGINEER)
        val director = SystemRoles.idOf(SystemRoles.PROJECT_DIRECTOR)

        // A discipline role needs a project and at least one discipline.
        assertEquals(400, assign(admin, """{"userId":"${user.id}","roleId":"$chief","projectId":"$projectId"}""").response.status)
        assertEquals(400, assign(admin, """{"userId":"${user.id}","roleId":"$chief","scopeType":"DISCIPLINE","scopeRefs":["CIVIL"]}""").response.status)
        val ok = assign(admin, """{"userId":"${user.id}","roleId":"$chief","projectId":"$projectId","scopeType":"DISCIPLINE","scopeRefs":["CIVIL"]}""")
        assertEquals(201, ok.response.status, ok.response.contentAsString)
        mvc.get("/api/v1/admin/assignments/${ok.field("id")}/effective-access") { cookie(admin.token) }.andExpect {
            status { isOk() }
            jsonPath("$.scopeType") { value("DISCIPLINE") }
            jsonPath("$.scopeRefs[0]") { value("CIVIL") }
        }

        // An organisation role needs an organisation and no project.
        assertEquals(400, assign(admin, """{"userId":"${user.id}","roleId":"$director","projectId":"$projectId"}""").response.status)
        assertEquals(201, assign(admin, """{"userId":"${user.id}","roleId":"$director","organizationId":"$orgId"}""").response.status)

        // Unknown role, user or project are 404s, not silent successes.
        assertEquals(404, assign(admin, """{"userId":"${user.id}","roleId":"${UUID.randomUUID()}"}""").response.status)
        assertEquals(404, assign(admin, """{"userId":"${UUID.randomUUID()}","roleId":"$director","organizationId":"$orgId"}""").response.status)
    }

    @Test
    fun `custom roles validate their permissions and system roles are read-only`() {
        val admin = admin()
        fun create(key: String, permissions: String) = mvc.post("/api/v1/admin/roles") {
            cookie(admin.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"key":"$key","name":"Chief Mechanical Engineer","portal":"BUYER","scopeLevel":"DISCIPLINE","permissions":$permissions}"""
        }.andReturn()

        val key = "CHIEF_MECH_${UUID.randomUUID().toString().take(6).uppercase()}"
        // A misspelt permission is rejected rather than dropped.
        val misspelt = create(key, """["package:read","package:raed"]""")
        assertEquals(400, misspelt.response.status)
        assertTrue("package:raed" in misspelt.response.contentAsString)
        assertEquals(400, create("lowercase", """["package:read"]""").response.status)

        val created = create(key, """["package:read","progress:read"]""")
        assertEquals(201, created.response.status, created.response.contentAsString)
        val roleId = created.field("id")
        assertEquals(409, create(key, """["package:read"]""").response.status)

        mvc.put("/api/v1/admin/roles/$roleId") {
            cookie(admin.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Chief Mechanical Engineer","permissions":["package:read","package:update"]}"""
        }.andExpect {
            status { isOk() }
            jsonPath("$.permissions.length()") { value(2) }
            jsonPath("$.permissions[1]") { value("package:update") }
        }

        val systemRole = SystemRoles.idOf(SystemRoles.VENDOR)
        mvc.put("/api/v1/admin/roles/$systemRole") {
            cookie(admin.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Vendor","permissions":["admin.user:manage"]}"""
        }.andExpect { status { isConflict() } }
        mvc.delete("/api/v1/admin/roles/$systemRole") { cookie(admin.token) }.andExpect { status { isConflict() } }

        // Cloning a system role is how it is customised.
        mvc.post("/api/v1/admin/roles/$systemRole/clone") {
            cookie(admin.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"key":"${key}_V","name":"Vendor (custom)"}"""
        }.andExpect {
            status { isCreated() }
            jsonPath("$.system") { value(false) }
        }

        // A role in use cannot be deleted; an unused one can.
        val user = registerVendor()
        val (_, projectId) = createProject(user.id)
        val inUse = assign(admin, """{"userId":"${user.id}","roleId":"$roleId","projectId":"$projectId","scopeType":"DISCIPLINE","scopeRefs":["MECHANICAL"]}""")
        assertEquals(201, inUse.response.status, inUse.response.contentAsString)
        mvc.delete("/api/v1/admin/roles/$roleId") { cookie(admin.token) }.andExpect { status { isConflict() } }
    }

    @Test
    fun `the platform cannot be left without an administrator`() {
        val admin = admin()
        val own = mvc.get("/api/v1/me/context") { cookie(admin.token) }.andReturn().field("defaultAssignmentId")

        mvc.delete("/api/v1/admin/assignments/$own") { cookie(admin.token) }.andExpect { status { isConflict() } }
        mvc.patch("/api/v1/admin/assignments/$own") {
            cookie(admin.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"suspended":true}"""
        }.andExpect { status { isConflict() } }

        val second = registerVendor()
        val adminRole = SystemRoles.idOf(SystemRoles.PLATFORM_ADMIN)
        val secondAdmin = assign(admin, """{"userId":"${second.id}","roleId":"$adminRole"}""")
        assertEquals(201, secondAdmin.response.status, secondAdmin.response.contentAsString)
        val secondId = secondAdmin.field("id")

        // With two working administrators, one may end the other's assignment...
        mvc.delete("/api/v1/admin/assignments/$own") { cookie(second.token); header(HEADER, secondId) }.andExpect { status { isNoContent() } }
        // ...but the remaining one is then protected.
        mvc.delete("/api/v1/admin/assignments/$secondId") { cookie(second.token); header(HEADER, secondId) }.andExpect { status { isConflict() } }

        // Restore the bootstrap admin for the other tests in this class.
        // Without the header the second user is still acting as a vendor.
        assertEquals(403, assign(second, """{"userId":"${admin.id}","roleId":"$adminRole"}""").response.status)
        val restoredOk = mvc.post("/api/v1/admin/assignments") {
            cookie(second.token); header(HEADER, secondId)
            contentType = MediaType.APPLICATION_JSON
            content = """{"userId":"${admin.id}","roleId":"$adminRole"}"""
        }.andReturn()
        assertEquals(201, restoredOk.response.status, restoredOk.response.contentAsString)
    }
}
