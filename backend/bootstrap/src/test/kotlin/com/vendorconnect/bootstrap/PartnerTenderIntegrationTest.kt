package com.vendorconnect.bootstrap

import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.MvcResult
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.multipart
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.nio.file.Files
import java.time.Instant
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/** Tenders and bidding as the partner portal uses them, plus the buyer's sealed view of the bids. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PartnerTenderIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-tender-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val BASE = "/api/v1/partner/tenders"
        val PDF = "%PDF-1.4 quotation".toByteArray()
    }

    private data class Partner(val token: Cookie, val userId: String, val companyId: String)

    private fun register(company: String): Partner {
        val result = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"user-${UUID.randomUUID()}@test.local","fullName":"Bid Manager","password":"correct-horse","companyName":"$company"}"""
        }.andReturn()
        val userId = Regex("\"id\":\"([^\"]+)\"").find(result.response.contentAsString)!!.groupValues[1]
        val companyId = jdbc.queryForObject("SELECT organization_id FROM users WHERE id = ?", String::class.java, userId)!!
        return Partner(assertNotNull(result.response.getCookie("vc_token")), userId, companyId)
    }

    private fun adminToken(): Cookie = assertNotNull(
        mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"admin@test.local","password":"admin-test-password-123"}"""
        }.andReturn().response.getCookie("vc_token")
    )

    private fun approveQualification(partner: Partner) {
        val now = Instant.now().toString()
        jdbc.update(
            """INSERT INTO qualification_applications (id, subject_type, subject_id, status, version, template_version, data_json, created_at, updated_at)
               VALUES (?, 'ORGANIZATION', ?, 'APPROVED', 1, 1, '{}', ?, ?)""",
            UUID.randomUUID().toString(), partner.companyId, now, now
        )
    }

    private fun createTender(status: String, closing: LocalDate, headUserId: String): String {
        val orgId = UUID.randomUUID().toString()
        val projectId = UUID.randomUUID().toString()
        val tenderId = UUID.randomUUID().toString()
        jdbc.update("INSERT INTO organizations (id, name, code, type) VALUES (?, 'Buyer Org', ?, 'GOVERNMENT_AUTHORITY')", orgId, "B-${orgId.take(8)}")
        jdbc.update(
            """INSERT INTO projects (id, name, corridor_name, organization_id, project_head_id, status, estimated_budget_minor, estimated_budget_currency)
               VALUES (?, 'Riverlink Highway', 'RH', ?, ?, 'IN_PROGRESS', 100000, 'INR')""", projectId, orgId, headUserId)
        jdbc.update(
            """INSERT INTO tenders (id, title, description, reference_number, project_id, estimated_value_minor, estimated_value_currency,
                   status, publish_date, closing_date)
               VALUES (?, 'Riverlink Earthworks', 'Bulk earthworks for package 3.', ?, ?, 1245000000, 'INR', ?, ?, ?)""",
            tenderId, "RI-${tenderId.take(8)}", projectId, status, LocalDate.now().minusDays(3).toString(), closing.toString())
        jdbc.update("INSERT INTO tender_items (id, tender_id, description, quantity, unit, estimated_rate_minor) VALUES (?, ?, 'Embankment fill', 280000, 'cum', 31337)",
            UUID.randomUUID().toString(), tenderId)
        return tenderId
    }

    private fun saveBid(partner: Partner, tenderId: String, body: String): MvcResult = mvc.put("$BASE/$tenderId/bid") {
        cookie(partner.token)
        contentType = MediaType.APPLICATION_JSON
        content = body
    }.andReturn()

    private fun upload(partner: Partner, tenderId: String, bytes: ByteArray = PDF): MvcResult =
        mvc.multipart("$BASE/$tenderId/bid/quotation") {
            file(MockMultipartFile("file", "Apex_Riverlink_Bid.pdf", "application/pdf", bytes))
            cookie(partner.token)
        }.andReturn()

    private fun act(partner: Partner, tenderId: String, action: String): MvcResult =
        mvc.post("$BASE/$tenderId/bid/$action") { cookie(partner.token) }.andReturn()

    @Test
    fun `a partner sees published tenders only, without the buyer's item rates`() {
        val partner = register("Listing Earthworks")
        val published = createTender("PUBLISHED", LocalDate.now().plusDays(10), partner.userId)
        val draft = createTender("DRAFT", LocalDate.now().plusDays(10), partner.userId)

        val list = mvc.get(BASE) { cookie(partner.token) }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue(published in list && draft !in list)

        val detail = mvc.get("$BASE/$published") { cookie(partner.token) }.andExpect {
            status { isOk() }
            jsonPath("$.title") { value("Riverlink Earthworks") }
            jsonPath("$.project") { value("Riverlink Highway") }
            jsonPath("$.open") { value(true) }
            jsonPath("$.daysLeft") { value(10) }
            jsonPath("$.lines[0].description") { value("Embankment fill") }
            jsonPath("$.lines[0].quantity") { value(280000) }
            jsonPath("$.eligible") { value(false) }
            jsonPath("$.bid") { doesNotExist() }
        }.andReturn().response.contentAsString
        assertFalse("31337" in detail || "estimatedRate" in detail, "the buyer's estimated rate must not reach bidders")

        // A tender that is not published does not exist as far as a bidder is concerned.
        mvc.get("$BASE/$draft") { cookie(partner.token) }.andExpect { status { isNotFound() } }
        assertEquals(404, saveBid(partner, draft, """{"amount":{"amountMinor":100,"currency":"INR"}}""").response.status)
    }

    @Test
    fun `a bid is drafted, needs an approved qualification to be submitted, and is then fixed unless withdrawn`() {
        val partner = register("Apex Earthworks Bidding")
        val rival = register("Rival Earthmovers")
        val tenderId = createTender("PUBLISHED", LocalDate.now().plusDays(5), partner.userId)

        // Drafting is open to anyone who can see the tender.
        assertEquals(400, saveBid(partner, tenderId, """{"validityDays":4000}""").response.status)
        assertEquals(200, saveBid(partner, tenderId, """{"amount":{"amountMinor":1245000000,"currency":"INR"},"validityDays":90,"note":"Excludes GST"}""").response.status)
        assertEquals(400, upload(partner, tenderId, "not a pdf".toByteArray()).response.status)
        assertEquals(200, upload(partner, tenderId).response.status)

        // Submitting is not, until the qualification is approved.
        mvc.get("$BASE/$tenderId") { cookie(partner.token) }.andExpect {
            jsonPath("$.bid.status") { value("DRAFT") }
            jsonPath("$.bid.amount.amountMinor") { value(1245000000) }
            jsonPath("$.bid.quotation.fileName") { value("Apex_Riverlink_Bid.pdf") }
            jsonPath("$.canSubmit") { value(false) }
            jsonPath("$.blockers[0]") { value("Complete and submit your qualification application.") }
        }
        act(partner, tenderId, "submit").let {
            assertEquals(400, it.response.status)
            assertTrue("qualification" in it.response.contentAsString)
        }

        approveQualification(partner)
        mvc.get("$BASE/$tenderId") { cookie(partner.token) }.andExpect { jsonPath("$.eligible") { value(true) }; jsonPath("$.canSubmit") { value(true) } }
        assertEquals(200, act(partner, tenderId, "submit").response.status)
        mvc.get("$BASE/$tenderId") { cookie(partner.token) }.andExpect {
            jsonPath("$.bid.status") { value("SUBMITTED") }
            jsonPath("$.canEdit") { value(false) }
            jsonPath("$.canWithdraw") { value(true) }
        }

        // Fixed once submitted.
        assertEquals(409, saveBid(partner, tenderId, """{"amount":{"amountMinor":1,"currency":"INR"}}""").response.status)
        assertEquals(409, upload(partner, tenderId).response.status)
        assertEquals(409, act(partner, tenderId, "submit").response.status)

        // Another bidder sees the tender but nothing of this bid.
        mvc.get("$BASE/$tenderId") { cookie(rival.token) }.andExpect { status { isOk() }; jsonPath("$.bid") { doesNotExist() } }
        mvc.get("$BASE/$tenderId/bid/quotation") { cookie(rival.token) }.andExpect { status { isNotFound() } }
        mvc.get("$BASE/$tenderId/bid/quotation") { cookie(partner.token) }.andExpect { status { isOk() } }

        // Withdrawing reopens it for changes while the tender is open.
        assertEquals(200, act(partner, tenderId, "withdraw").response.status)
        assertEquals(200, saveBid(partner, tenderId, """{"amount":{"amountMinor":1200000000,"currency":"INR"},"validityDays":90}""").response.status)
        assertEquals(200, act(partner, tenderId, "submit").response.status)

        // The audit log records that a bid was made, not how much it was for.
        val audit = jdbc.queryForObject("SELECT group_concat(summary, ' | ') FROM audit_log WHERE entity_type = 'BID'", String::class.java)!!
        assertTrue("submitted a bid" in audit && "withdrew" in audit)
        assertFalse("1245000000" in audit || "1200000000" in audit || "12,00" in audit)
    }

    @Test
    fun `bids stay sealed from the buyer until the tender closes, and closing ends all changes`() {
        val partner = register("Sealed Bid Constructions")
        val tenderId = createTender("PUBLISHED", LocalDate.now(), partner.userId)  // closes at the end of today
        approveQualification(partner)
        saveBid(partner, tenderId, """{"amount":{"amountMinor":990000000,"currency":"INR"}}""")
        upload(partner, tenderId)
        assertEquals(200, act(partner, tenderId, "submit").response.status)

        val admin = adminToken()
        // Still open on its closing date: sealed.
        mvc.get("/api/v1/tenders/$tenderId/bids") { cookie(admin) }.andExpect { status { isConflict() } }
        // Bidders can never read the bid list, open or closed.
        mvc.get("/api/v1/tenders/$tenderId/bids") { cookie(partner.token) }.andExpect { status { isForbidden() } }

        jdbc.update("UPDATE tenders SET closing_date = ? WHERE id = ?", LocalDate.now().minusDays(1).toString(), tenderId)

        mvc.get("/api/v1/tenders/$tenderId/bids") { cookie(admin) }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].bidder") { value("Sealed Bid Constructions") }
            jsonPath("$[0].amount.amountMinor") { value(990000000) }
        }

        // Closed: the bidder still sees their bid, and can no longer change or withdraw it.
        mvc.get("$BASE/$tenderId") { cookie(partner.token) }.andExpect {
            status { isOk() }
            jsonPath("$.open") { value(false) }
            jsonPath("$.bid.status") { value("SUBMITTED") }
            jsonPath("$.canWithdraw") { value(false) }
        }
        assertEquals(409, act(partner, tenderId, "withdraw").response.status)

        // A newcomer who never bid cannot start one on a closed tender.
        val late = register("Too Late Infra")
        assertEquals(409, saveBid(late, tenderId, """{"amount":{"amountMinor":1,"currency":"INR"}}""").response.status)
    }
}
