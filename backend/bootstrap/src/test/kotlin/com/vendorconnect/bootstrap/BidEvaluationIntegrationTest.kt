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
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.nio.file.Files
import java.time.Instant
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/** The buyer's bid comparison and award: sealed until closing, ranked afterwards, awarded once with a reason. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BidEvaluationIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-evaluation-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val EVALUATIONS = "/api/v1/tender-evaluations"
        const val PARTNER = "/api/v1/partner/tenders"
    }

    private data class Partner(val token: Cookie, val userId: String, val companyId: String, val name: String)

    private fun register(company: String): Partner {
        val result = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"user-${UUID.randomUUID()}@test.local","fullName":"Bid Manager","password":"correct-horse","companyName":"$company"}"""
        }.andReturn()
        val userId = Regex("\"id\":\"([^\"]+)\"").find(result.response.contentAsString)!!.groupValues[1]
        val companyId = jdbc.queryForObject("SELECT organization_id FROM users WHERE id = ?", String::class.java, userId)!!
        val now = Instant.now().toString()
        // Qualification already approved, so the partner can submit bids.
        jdbc.update(
            """INSERT INTO qualification_applications (id, subject_type, subject_id, status, version, template_version, data_json, created_at, updated_at)
               VALUES (?, 'ORGANIZATION', ?, 'APPROVED', 1, 1, '{}', ?, ?)""", UUID.randomUUID().toString(), companyId, now, now)
        return Partner(assertNotNull(result.response.getCookie("vc_token")), userId, companyId, company)
    }

    private fun login(email: String, password: String): Cookie = assertNotNull(
        mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","password":"$password"}"""
        }.andReturn().response.getCookie("vc_token")
    )

    private fun admin() = login("admin@test.local", "admin-test-password-123")

    /** A published tender for a work package, with a buyer's estimate of 1,00,00,000.00. Returns tender id and package id. */
    private fun createTender(headUserId: String, closing: LocalDate): Pair<String, String> {
        val ids = List(5) { UUID.randomUUID().toString() }
        val (orgId, projectId, sectionId, packageId, tenderId) = ids
        jdbc.update("INSERT INTO organizations (id, name, code, type) VALUES (?, 'Buyer Org', ?, 'GOVERNMENT_AUTHORITY')", orgId, "B-${orgId.take(8)}")
        jdbc.update(
            """INSERT INTO projects (id, name, corridor_name, organization_id, project_head_id, status, estimated_budget_minor, estimated_budget_currency)
               VALUES (?, 'Riverlink Highway', 'RH', ?, ?, 'IN_PROGRESS', 100000, 'INR')""", projectId, orgId, headUserId)
        jdbc.update(
            """INSERT INTO project_sections (id, project_id, name, start_latitude, start_longitude, end_latitude, end_longitude, length_km)
               VALUES (?, ?, 'Section 1', 0, 0, 1, 1, 10)""", sectionId, projectId)
        jdbc.update("INSERT INTO corridor_packages (id, section_id, package_number, description) VALUES (?, ?, 'PKG-3', 'Earthworks')", packageId, sectionId)
        jdbc.update(
            """INSERT INTO tenders (id, title, description, reference_number, project_id, package_id, estimated_value_minor,
                   estimated_value_currency, status, publish_date, closing_date)
               VALUES (?, 'Riverlink Earthworks', 'Bulk earthworks.', ?, ?, ?, 1000000000, 'INR', 'PUBLISHED', ?, ?)""",
            tenderId, "RI-${tenderId.take(8)}", projectId, packageId, LocalDate.now().minusDays(20).toString(), closing.toString())
        return tenderId to packageId
    }

    private fun bid(partner: Partner, tenderId: String, amountMinor: Long, validityDays: Int = 90) {
        mvc.put("$PARTNER/$tenderId/bid") {
            cookie(partner.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"amount":{"amountMinor":$amountMinor,"currency":"INR"},"validityDays":$validityDays}"""
        }.andExpect { status { isOk() } }
        mvc.multipart("$PARTNER/$tenderId/bid/quotation") {
            file(MockMultipartFile("file", "${partner.name}.pdf", "application/pdf", "%PDF-1.4 quote".toByteArray()))
            cookie(partner.token)
        }.andExpect { status { isOk() } }
        mvc.post("$PARTNER/$tenderId/bid/submit") { cookie(partner.token) }.andExpect { status { isOk() } }
    }

    private fun award(token: Cookie, tenderId: String, bidId: String, reason: String): MvcResult = mvc.post("$EVALUATIONS/$tenderId/award") {
        cookie(token)
        contentType = MediaType.APPLICATION_JSON
        content = """{"bidId":"$bidId","reason":"$reason"}"""
    }.andReturn()

    private fun bidIdOf(partner: Partner, tenderId: String): String =
        jdbc.queryForObject("SELECT id FROM bids WHERE tender_id = ? AND subject_id = ?", String::class.java, tenderId, partner.companyId)!!

    @Test
    fun `bids are sealed while the tender is open, then ranked against each other and the estimate`() {
        val low = register("Lowest Earthmovers")
        val mid = register("Middle Constructions")
        val high = register("Highest Infra")
        val (tenderId, _) = createTender(low.userId, LocalDate.now().plusDays(3))
        bid(mid, tenderId, 1_050_000_000)
        bid(low, tenderId, 990_000_000)
        bid(high, tenderId, 1_200_000_000)
        // A draft that was never submitted is not a bid.
        val drafter = register("Only Drafted Ltd")
        mvc.put("$PARTNER/$tenderId/bid") {
            cookie(drafter.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"amount":{"amountMinor":1,"currency":"INR"}}"""
        }.andExpect { status { isOk() } }

        val admin = admin()
        // Open: nothing about the bids is disclosed, not even how many there are.
        val sealed = mvc.get("$EVALUATIONS/$tenderId") { cookie(admin) }.andExpect {
            status { isOk() }
            jsonPath("$.sealed") { value(true) }
            jsonPath("$.stage") { value("OPEN") }
            jsonPath("$.bids") { doesNotExist() }
            jsonPath("$.bidCount") { doesNotExist() }
            jsonPath("$.canAward") { value(false) }
        }.andReturn().response.contentAsString
        assertTrue("Lowest Earthmovers" !in sealed && "990000000" !in sealed)
        assertEquals(409, award(admin, tenderId, bidIdOf(low, tenderId), "Lowest compliant bid received.").response.status)
        mvc.get("$EVALUATIONS/$tenderId/bids/${bidIdOf(low, tenderId)}/quotation") { cookie(admin) }.andExpect { status { isConflict() } }
        // Bidders never get the buyer's view.
        mvc.get("$EVALUATIONS/$tenderId") { cookie(low.token) }.andExpect { status { isForbidden() } }
        mvc.get(EVALUATIONS) { cookie(low.token) }.andExpect { status { isForbidden() } }

        jdbc.update("UPDATE tenders SET closing_date = ? WHERE id = ?", LocalDate.now().minusDays(1).toString(), tenderId)

        mvc.get("$EVALUATIONS/$tenderId") { cookie(admin) }.andExpect {
            status { isOk() }
            jsonPath("$.sealed") { value(false) }
            jsonPath("$.stage") { value("EVALUATION") }
            jsonPath("$.bidCount") { value(3) }
            jsonPath("$.bids[0].bidder") { value("Lowest Earthmovers") }
            jsonPath("$.bids[0].rank") { value(1) }
            jsonPath("$.bids[0].versusEstimatePct") { value(-1.0) }
            jsonPath("$.bids[0].versusLowestPct") { value(0.0) }
            jsonPath("$.bids[0].qualification") { value("APPROVED") }
            jsonPath("$.bids[0].quotationFileName") { value("Lowest Earthmovers.pdf") }
            jsonPath("$.bids[1].bidder") { value("Middle Constructions") }
            jsonPath("$.bids[1].rank") { value(2) }
            jsonPath("$.bids[1].versusEstimatePct") { value(5.0) }
            jsonPath("$.bids[1].versusLowestPct") { value(6.1) }
            jsonPath("$.bids[2].rank") { value(3) }
            jsonPath("$.bids[2].versusEstimatePct") { value(20.0) }
            jsonPath("$.canAward") { value(true) }
        }
        mvc.get("$EVALUATIONS/$tenderId/bids/${bidIdOf(mid, tenderId)}/quotation") { cookie(admin) }.andExpect { status { isOk() } }
        mvc.get(EVALUATIONS) { cookie(admin) }.andExpect {
            status { isOk() }
            jsonPath("$[?(@.tenderId == '$tenderId')].bidCount") { value(3) }
        }
    }

    @Test
    fun `a tender is awarded once, with a reason, by someone allowed to, and both sides see the result`() {
        val low = register("Award Low Earthmovers")
        val chosen = register("Award Chosen Constructions")
        val (tenderId, packageId) = createTender(low.userId, LocalDate.now().plusDays(3))
        bid(low, tenderId, 990_000_000)
        bid(chosen, tenderId, 1_050_000_000)
        jdbc.update("UPDATE tenders SET closing_date = ? WHERE id = ?", LocalDate.now().minusDays(1).toString(), tenderId)
        val admin = admin()

        // An evaluator who may compare but not award.
        val evaluatorEmail = "epc-${UUID.randomUUID()}@test.local"
        val evaluatorId = Regex("\"id\":\"([^\"]+)\"").find(
            mvc.post("/api/v1/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = """{"email":"$evaluatorEmail","fullName":"Evaluator","password":"correct-horse"}"""
            }.andReturn().response.contentAsString
        )!!.groupValues[1]
        mvc.patch("/api/v1/admin/users/$evaluatorId") {
            cookie(admin)
            contentType = MediaType.APPLICATION_JSON
            content = """{"role":"EPC_MANAGER"}"""
        }.andExpect { status { isOk() } }
        val evaluator = login(evaluatorEmail, "correct-horse")
        mvc.get("$EVALUATIONS/$tenderId") { cookie(evaluator) }.andExpect {
            status { isOk() }
            jsonPath("$.bidCount") { value(2) }
            jsonPath("$.canAward") { value(false) }
            jsonPath("$.awardBlockedReason") { value("Your role can compare bids but not award.") }
        }
        assertEquals(403, award(evaluator, tenderId, bidIdOf(low, tenderId), "Lowest compliant bid received.").response.status)

        // Choosing a bid that is not the lowest needs a real justification.
        val chosenBid = bidIdOf(chosen, tenderId)
        award(admin, tenderId, chosenBid, "ok").let {
            assertEquals(400, it.response.status)
            assertTrue("not the lowest bid" in it.response.contentAsString)
        }
        assertEquals(404, award(admin, tenderId, UUID.randomUUID().toString(), "Lowest compliant bid received.").response.status)

        val awarded = award(admin, tenderId, chosenBid, "Lowest bidder lacks the piling rigs this package needs.")
        assertEquals(200, awarded.response.status, awarded.response.contentAsString)
        mvc.get("$EVALUATIONS/$tenderId") { cookie(admin) }.andExpect {
            jsonPath("$.stage") { value("AWARDED") }
            jsonPath("$.status") { value("AWARDED") }
            jsonPath("$.award.bidder") { value("Award Chosen Constructions") }
            jsonPath("$.award.reason") { value("Lowest bidder lacks the piling rigs this package needs.") }
            jsonPath("$.bids[1].awarded") { value(true) }
            jsonPath("$.bids[0].awarded") { value(false) }
            jsonPath("$.canAward") { value(false) }
        }
        // Once only.
        assertEquals(409, award(admin, tenderId, bidIdOf(low, tenderId), "Changed our minds about this one.").response.status)

        // The winner becomes the package's contractor, and each bidder sees how it went.
        assertEquals(chosen.companyId, jdbc.queryForObject("SELECT contractor_id FROM corridor_packages WHERE id = ?", String::class.java, packageId))
        assertEquals("AWARDED", jdbc.queryForObject("SELECT status FROM tenders WHERE id = ?", String::class.java, tenderId))
        mvc.get("$PARTNER/$tenderId") { cookie(chosen.token) }.andExpect { status { isOk() }; jsonPath("$.outcome") { value("AWARDED_TO_YOU") } }
        mvc.get("$PARTNER/$tenderId") { cookie(low.token) }.andExpect { status { isOk() }; jsonPath("$.outcome") { value("NOT_SELECTED") } }

        val audit = jdbc.queryForObject("SELECT summary FROM audit_log WHERE action = 'TENDER_AWARDED' AND entity_id = ?", String::class.java, tenderId)!!
        assertTrue("Award Chosen Constructions" in audit && "not the lowest bid" in audit)
    }

    @Test
    fun `a bid whose offer has lapsed cannot be awarded`() {
        val partner = register("Lapsed Offer Infra")
        val (tenderId, _) = createTender(partner.userId, LocalDate.now().plusDays(3))
        bid(partner, tenderId, 990_000_000, validityDays = 5)
        // Closed 30 days ago: an offer valid for 5 days ran out long since.
        jdbc.update("UPDATE tenders SET closing_date = ? WHERE id = ?", LocalDate.now().minusDays(30).toString(), tenderId)

        award(admin(), tenderId, bidIdOf(partner, tenderId), "Lowest compliant bid received.").let {
            assertEquals(400, it.response.status)
            assertTrue("validity has expired" in it.response.contentAsString)
        }
    }
}
