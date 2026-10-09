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
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.nio.file.Files
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/** The fleet register and "my bids" list behind the vendor workspace. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VendorWorkspaceIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-workspace-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val MACHINES = "/api/v1/machines"
    }

    private data class Partner(val token: Cookie, val userId: String)

    private fun register(company: String): Partner {
        val result = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"user-${UUID.randomUUID()}@test.local","fullName":"Fleet Manager","password":"correct-horse","companyName":"$company"}"""
        }.andReturn()
        val userId = Regex("\"id\":\"([^\"]+)\"").find(result.response.contentAsString)!!.groupValues[1]
        return Partner(assertNotNull(result.response.getCookie("vc_token")), userId)
    }

    private fun adminToken(): Cookie = assertNotNull(
        mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"admin@test.local","password":"admin-test-password-123"}"""
        }.andReturn().response.getCookie("vc_token")
    )

    private fun addMachine(token: Cookie, body: String): MvcResult = mvc.post(MACHINES) {
        cookie(token)
        contentType = MediaType.APPLICATION_JSON
        content = body
    }.andReturn()

    private fun idOf(result: MvcResult): String = Regex("\"_id\":\"([^\"]+)\"").find(result.response.contentAsString)!!.groupValues[1]

    @Test
    fun `an owner adds, edits and removes a machine`() {
        val owner = register("Crud Cranes")
        assertEquals("""{"data":[],"success":true}""", mvc.get(MACHINES) { cookie(owner.token) }.andReturn().response.contentAsString)

        val created = addMachine(owner.token,
            """{"machineCode":"ex-01","name":"Big Digger","machineType":"EXCAVATOR","yearOfManufacture":2021,"insuranceExpiry":"2030-01-31","lastMaintenanceDate":""}""")
        assertEquals(201, created.response.status)
        val id = idOf(created)
        assertTrue("\"machineCode\":\"EX-01\"" in created.response.contentAsString)
        assertTrue("\"status\":\"AVAILABLE\"" in created.response.contentAsString)

        val updated = mvc.put("$MACHINES/$id") {
            cookie(owner.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"machineCode":"EX-01","machineType":"EXCAVATOR","location":"Pune yard","status":"MAINTENANCE"}"""
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue("\"location\":\"Pune yard\"" in updated && "\"status\":\"MAINTENANCE\"" in updated)

        val detail = mvc.get("$MACHINES/$id") { cookie(owner.token) }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue("\"success\":true" in detail && "\"mine\":true" in detail)

        mvc.delete("$MACHINES/$id") { cookie(owner.token) }.andExpect { status { isOk() } }
        mvc.get("$MACHINES/$id") { cookie(owner.token) }.andExpect { status { isNotFound() } }
    }

    @Test
    fun `a machine needs a code and a type, and the code is unique per owner`() {
        val owner = register("Strict Machines")
        val invalid = addMachine(owner.token, """{"name":"Nameless","yearOfManufacture":1800,"lastMaintenanceDate":"2999-01-01"}""")
        assertEquals(400, invalid.response.status)
        val body = invalid.response.contentAsString
        assertTrue(listOf("machineCode", "machineType", "yearOfManufacture", "lastMaintenanceDate").all { it in body })

        assertEquals(201, addMachine(owner.token, """{"machineCode":"TC-1","machineType":"TOWER_CRANE"}""").response.status)
        assertEquals(409, addMachine(owner.token, """{"machineCode":"tc-1","machineType":"TOWER_CRANE"}""").response.status)

        // another owner may reuse the code
        assertEquals(201, addMachine(register("Other Machines").token, """{"machineCode":"TC-1","machineType":"TOWER_CRANE"}""").response.status)
    }

    @Test
    fun `owners see only their own fleet, an administrator sees all and changes none`() {
        val first = register("First Fleet")
        val second = register("Second Fleet")
        val id = idOf(addMachine(first.token, """{"machineCode":"FF-${UUID.randomUUID().toString().take(6)}","machineType":"LOADER"}"""))

        assertTrue(id !in mvc.get(MACHINES) { cookie(second.token) }.andReturn().response.contentAsString)
        mvc.get("$MACHINES/$id") { cookie(second.token) }.andExpect { status { isNotFound() } }
        mvc.delete("$MACHINES/$id") { cookie(second.token) }.andExpect { status { isNotFound() } }

        val admin = adminToken()
        val all = mvc.get(MACHINES) { cookie(admin) }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue(id in all && "\"ownerName\":\"First Fleet\"" in all && "\"mine\":false" in all)
        mvc.delete("$MACHINES/$id") { cookie(admin) }.andExpect { status { isNotFound() } }
        mvc.get("$MACHINES/$id") { cookie(first.token) }.andExpect { status { isOk() } }

        mvc.get(MACHINES).andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `my bids lists the tenders the caller has bid on`() {
        val partner = register("Bidding Fleet")
        val orgId = UUID.randomUUID().toString()
        val projectId = UUID.randomUUID().toString()
        val tenderId = UUID.randomUUID().toString()
        jdbc.update("INSERT INTO organizations (id, name, code, type) VALUES (?, 'Buyer Org', ?, 'GOVERNMENT_AUTHORITY')", orgId, "B-${orgId.take(8)}")
        jdbc.update(
            """INSERT INTO projects (id, name, corridor_name, organization_id, project_head_id, status, estimated_budget_minor, estimated_budget_currency)
               VALUES (?, 'Riverlink Highway', 'RH', ?, ?, 'IN_PROGRESS', 100000, 'INR')""", projectId, orgId, partner.userId)
        jdbc.update(
            """INSERT INTO tenders (id, title, description, reference_number, project_id, estimated_value_minor, estimated_value_currency,
                   status, publish_date, closing_date)
               VALUES (?, 'Riverlink Earthworks', 'Bulk earthworks.', ?, ?, 1245000000, 'INR', 'PUBLISHED', ?, ?)""",
            tenderId, "RI-${tenderId.take(8)}", projectId, LocalDate.now().minusDays(3).toString(), LocalDate.now().plusDays(10).toString())

        assertEquals("""{"data":[],"success":true}""", mvc.get("/api/v1/bids/my") { cookie(partner.token) }.andReturn().response.contentAsString)

        mvc.put("/api/v1/partner/tenders/$tenderId/bid") {
            cookie(partner.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"amount":{"amountMinor":987654300,"currency":"INR"},"validityDays":90}"""
        }.andExpect { status { isOk() } }

        val mine = mvc.get("/api/v1/bids/my") { cookie(partner.token) }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue("\"tenderId\":\"$tenderId\"" in mine && "\"status\":\"DRAFT\"" in mine && "987654300" in mine && "Riverlink Earthworks" in mine)

        assertEquals("""{"data":[],"success":true}""",
            mvc.get("/api/v1/bids/my") { cookie(register("Idle Fleet").token) }.andReturn().response.contentAsString)
    }
}
