package com.vendorconnect.bootstrap

import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.mock.web.MockHttpSession
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.MvcResult
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.multipart
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import org.springframework.test.web.servlet.request.RequestPostProcessor
import java.nio.file.Files
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * The partner's qualification application through its API, as the partner portal uses it:
 * draft, validate, upload, submit, be sent back, resubmit, be approved.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PartnerQualificationIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-qualification-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val BASE = "/api/v1/partner/qualification"
        const val ADMIN_PORT = 18081
        val PDF = "%PDF-1.4 sample".toByteArray()
        val DOCUMENTS = listOf("registrationDocument", "cancelledCheque", "gstCertificate", "auditedStatements",
            "experienceCertificate", "safetyPolicyDocument", "insurancePolicy")

        val STEPS = mapOf(
            "company" to """{"legalName":"Apex Earthworks","entityType":"Partnership","incorporationDate":"2018-03-12","country":"India",
                "pan":"aaqpa1234r","registeredAddress":"42 Construction Road, Pune"}""",
            "capabilities" to """{"tradeCategories":["Earthworks","Site clearing"],"serviceRegions":["National"],
                "primaryContactName":"Rahul Mehta","primaryContactEmail":"rahul@apex.test","primaryContactPhone":"+91 98765 43210"}""",
            "banking" to """{"accountHolderName":"Apex Earthworks","accountNumber":"123456784321","ifsc":"hdfc0001234",
                "gstApplicable":"YES","gstin":"27AAQPA1234R1Z5"}""",
            "financial" to """{"financialYear":"2024-25","annualTurnoverLakhs":"12,850","netProfitLakhs":1265}""",
            "technical" to """{"largestProjectName":"NH-48 Earthworks Package","largestProjectClient":"Western Roads Authority",
                "largestProjectValueLakhs":8500,"largestProjectYear":2023,"totalManpower":180,"engineersSupervisors":18}""",
            "hse" to """{"safetyPolicy":"YES","safetySupervisor":"YES","lostTimeIncidents":0,"insuranceCover":"YES"}"""
        )
    }

    private fun register(companyName: String?): Cookie {
        val company = companyName?.let { ""","companyName":"$it"""" }.orEmpty()
        val result = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"user-${UUID.randomUUID()}@test.local","fullName":"Priya Shah","password":"correct-horse"$company}"""
        }.andReturn()
        return assertNotNull(result.response.getCookie("vc_token"))
    }

    private fun save(token: Cookie, step: String, values: String): MvcResult = mvc.put("$BASE/steps/$step") {
        cookie(token)
        contentType = MediaType.APPLICATION_JSON
        content = """{"values":$values}"""
    }.andReturn()

    private fun upload(token: Cookie, field: String, bytes: ByteArray = PDF, name: String = "$field.pdf"): MvcResult =
        mvc.multipart("$BASE/documents/$field") {
            file(MockMultipartFile("file", name, "application/pdf", bytes))
            cookie(token)
        }.andReturn()

    private fun submit(token: Cookie, accepted: Boolean = true): MvcResult = mvc.post("$BASE/submit") {
        cookie(token)
        contentType = MediaType.APPLICATION_JSON
        content = """{"declaredAccurate":$accepted,"consentToShare":$accepted}"""
    }.andReturn()

    private fun fillEverything(token: Cookie) {
        STEPS.forEach { (step, values) -> assertEquals(200, save(token, step, values).response.status, step) }
        DOCUMENTS.forEach { assertEquals(200, upload(token, it).response.status, it) }
    }

    @Test
    fun `a draft is validated as it is saved and sensitive answers never come back or sit in the database as entered`() {
        val token = register("Apex Earthworks")

        mvc.get(BASE) { cookie(token) }.andExpect {
            status { isOk() }
            jsonPath("$.status") { value("DRAFT") }
            jsonPath("$.applicant") { value("Apex Earthworks") }
            jsonPath("$.sectionsCompleted") { value(0) }
            jsonPath("$.sectionsTotal") { value(6) }
            jsonPath("$.canSubmit") { value(false) }
            jsonPath("$.steps[0].fields[?(@.key == 'pan')].sensitive") { value(true) }
        }

        // A malformed answer is refused with a message for that field, and nothing from that save is kept.
        mvc.put("$BASE/steps/company") {
            cookie(token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"values":{"legalName":"Apex Earthworks","pan":"NOT-A-PAN","incorporationDate":"2999-01-01","entityType":"Guild"}}"""
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.fieldErrors.pan") { exists() }
            jsonPath("$.fieldErrors.incorporationDate") { exists() }
            jsonPath("$.fieldErrors.entityType") { exists() }
        }
        mvc.get(BASE) { cookie(token) }.andExpect { jsonPath("$.steps[0].state") { value("NOT_STARTED") } }

        // A partial save is fine; the step is then in progress.
        val saved = save(token, "company", STEPS.getValue("company")).response.contentAsString
        assertTrue("\"maskedValue\":\"•••• 234R\"" in saved, saved)
        assertFalse("AAQPA1234R" in saved, "the PAN must not be returned")
        mvc.get(BASE) { cookie(token) }.andExpect { jsonPath("$.steps[0].state") { value("IN_PROGRESS") } }

        // Every application in the database, whichever test wrote it.
        val stored = jdbc.queryForObject("SELECT group_concat(data_json) FROM qualification_applications", String::class.java)!!
        assertFalse("AAQPA1234R" in stored.uppercase(), "the PAN must be encrypted at rest")
        assertTrue("enc:v1:" in stored)

        // Saving the step again with the sensitive field left blank keeps what was stored.
        save(token, "company", """{"legalName":"Apex Earthworks Pvt","pan":""}""")
        mvc.get(BASE) { cookie(token) }.andExpect {
            jsonPath("$.steps[0].fields[?(@.key == 'pan')].maskedValue") { value("•••• 234R") }
            jsonPath("$.steps[0].fields[?(@.key == 'legalName')].value") { value("Apex Earthworks Pvt") }
        }
    }

    @Test
    fun `documents are checked by content, replaced on re-upload and visible only to their owner`() {
        val owner = register("Docs Owner Ltd")
        val stranger = register("Stranger Infra")

        // The name and declared type say PDF; the content does not.
        mvc.multipart("$BASE/documents/registrationDocument") {
            file(MockMultipartFile("file", "invoice.pdf", "application/pdf", "<html>not a pdf</html>".toByteArray()))
            cookie(owner)
        }.andExpect { status { isBadRequest() }; jsonPath("$.fieldErrors.registrationDocument") { exists() } }
        // Only document fields accept files.
        assertEquals(404, upload(owner, "legalName").response.status)

        assertEquals(200, upload(owner, "registrationDocument", name = "first.pdf").response.status)
        val replaced = upload(owner, "registrationDocument", name = "second.pdf").response.contentAsString
        assertTrue("second.pdf" in replaced && "first.pdf" !in replaced)
        assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM qualification_documents WHERE field_key = 'registrationDocument'", Int::class.java))

        mvc.get("$BASE/documents/registrationDocument/content") { cookie(owner) }.andExpect {
            status { isOk() }
            header { string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")) }
            header { string("X-Content-Type-Options", "nosniff") }
        }
        // Another company has its own, empty application and cannot reach this file.
        mvc.get("$BASE/documents/registrationDocument/content") { cookie(stranger) }.andExpect { status { isNotFound() } }
        mvc.get(BASE) { cookie(stranger) }.andExpect { jsonPath("$.applicant") { value("Stranger Infra") }; jsonPath("$.sectionsCompleted") { value(0) } }

        mvc.delete("$BASE/documents/registrationDocument") { cookie(owner) }.andExpect { status { isOk() } }
        mvc.get("$BASE/documents/registrationDocument/content") { cookie(owner) }.andExpect { status { isNotFound() } }
    }

    @Test
    fun `an application is submitted once complete, locked, sent back, resubmitted and approved`() {
        val token = register("Submit Flow Constructions")

        // Not complete yet: refused, with the first missing item named.
        save(token, "company", STEPS.getValue("company"))
        submit(token).let {
            assertEquals(400, it.response.status)
            assertTrue("still missing" in it.response.contentAsString)
        }

        fillEverything(token)
        mvc.get(BASE) { cookie(token) }.andExpect {
            jsonPath("$.sectionsCompleted") { value(6) }
            jsonPath("$.missing.length()") { value(0) }
            jsonPath("$.canSubmit") { value(true) }
        }
        // A conditional requirement: with GST applicable the GSTIN is required, without it it is not.
        save(token, "banking", """{"gstin":""}""")
        mvc.get(BASE) { cookie(token) }.andExpect { jsonPath("$.missing[0].fieldKey") { value("gstin") } }
        save(token, "banking", """{"gstApplicable":"NO"}""")
        mvc.get(BASE) { cookie(token) }.andExpect { jsonPath("$.missing.length()") { value(0) } }

        assertEquals(400, submit(token, accepted = false).response.status)  // declarations not accepted
        submit(token).let { assertEquals(200, it.response.status, it.response.contentAsString) }
        mvc.get(BASE) { cookie(token) }.andExpect { jsonPath("$.status") { value("SUBMITTED") }; jsonPath("$.editable") { value(false) } }

        // Locked while under review.
        assertEquals(409, save(token, "company", """{"legalName":"Changed"}""").response.status)
        assertEquals(409, upload(token, "cancelledCheque").response.status)

        // Reviewer: reads it in the console and sends it back.
        val adminPort = RequestPostProcessor { it.apply { localPort = ADMIN_PORT; serverPort = ADMIN_PORT } }
        val session = mvc.post("/admin/login") {
            with(adminPort); with(csrf())
            param("email", "admin@test.local"); param("password", "admin-test-password-123")
        }.andReturn().request.getSession(false) as MockHttpSession
        val id = jdbc.queryForObject("SELECT id FROM qualification_applications WHERE status = 'SUBMITTED'", String::class.java)!!

        val list = mvc.get("/admin/qualifications") { with(adminPort); this.session = session }.andExpect { status { isOk() } }.andReturn()
        assertTrue("Submit Flow Constructions" in list.response.contentAsString)
        val detail = mvc.get("/admin/qualifications/$id") { with(adminPort); this.session = session }
            .andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue("NH-48 Earthworks Package" in detail && "•••• 234R" in detail && "AAQPA1234R" !in detail)
        mvc.get("/admin/qualifications/$id/documents/cancelledCheque") { with(adminPort); this.session = session }
            .andExpect { status { isOk() } }

        fun decide(decision: String, note: String?) = mvc.post("/admin/qualifications/$id/decision") {
            with(adminPort); with(csrf()); this.session = session
            header("Referer", "http://localhost:$ADMIN_PORT/admin/qualifications/$id")
            param("decision", decision)
            note?.let { param("note", it) }
        }.andReturn()

        assertNotNull(decide("CORRECTION_REQUIRED", null).flashMap["flashError"], "a correction needs a note")
        assertEquals(null, decide("CORRECTION_REQUIRED", "Legal name does not match the registration document.").flashMap["flashError"])

        // Partner: sees the note, fixes, resubmits as version 2.
        mvc.get(BASE) { cookie(token) }.andExpect {
            jsonPath("$.status") { value("CORRECTION_REQUIRED") }
            jsonPath("$.editable") { value(true) }
            jsonPath("$.reviewNote") { value("Legal name does not match the registration document.") }
        }
        assertEquals(200, save(token, "company", """{"legalName":"Apex Civil & Earthworks"}""").response.status)
        submit(token)
        mvc.get(BASE) { cookie(token) }.andExpect { jsonPath("$.status") { value("SUBMITTED") }; jsonPath("$.version") { value(2) } }

        assertEquals(null, decide("APPROVED", null).flashMap["flashError"])
        mvc.get(BASE) { cookie(token) }.andExpect { jsonPath("$.status") { value("APPROVED") }; jsonPath("$.editable") { value(false) } }
        // Already decided: a second decision is refused.
        assertNotNull(decide("REJECTED", "Changed my mind").flashMap["flashError"])
    }
}
