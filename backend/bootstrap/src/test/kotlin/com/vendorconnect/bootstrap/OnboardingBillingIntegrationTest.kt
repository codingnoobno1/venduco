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
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.MvcResult
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.request.RequestPostProcessor
import java.nio.file.Files
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Approval and subscription billing end to end: who registers waits for approval (company-wise or
 * one person at a time), an account on a plan is let in only while it is paid, and all of it is
 * driven from the admin console's forms.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = ["app.onboarding.require-approval=true", "app.billing.enforce=true", "app.billing.grace-days=5"])
class OnboardingBillingIntegrationTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val jdbc: JdbcTemplate
) {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun database(registry: DynamicPropertyRegistry) {
            val db = Files.createTempFile("vc-billing-test-", ".db").also { it.toFile().deleteOnExit() }
            registry.add("spring.datasource.url") { "jdbc:sqlite:${db.toAbsolutePath()}?foreign_keys=true" }
        }

        const val ADMIN_PORT = 18081
        const val ADMIN_EMAIL = "admin@test.local"
        const val ADMIN_PASSWORD = "admin-test-password-123"
    }

    private data class Registered(val id: String, val email: String, val token: Cookie)

    private val adminPort = RequestPostProcessor { it.apply { localPort = ADMIN_PORT; serverPort = ADMIN_PORT } }

    private val session: MockHttpSession by lazy {
        val result = mvc.post("/admin/login") {
            with(adminPort); with(csrf())
            param("email", ADMIN_EMAIL); param("password", ADMIN_PASSWORD)
        }.andReturn()
        assertEquals("/admin", result.response.redirectedUrl)
        result.request.getSession(false) as MockHttpSession
    }

    private fun register(companyName: String? = null): Registered {
        val email = "user-${UUID.randomUUID()}@test.local"
        val company = companyName?.let { ""","companyName":"$it"""" }.orEmpty()
        val result = mvc.post("/api/v1/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","fullName":"Test Person","password":"correct-horse"$company}"""
        }.andReturn()
        assertEquals(200, result.response.status, result.response.contentAsString)
        val id = Regex("\"id\":\"([^\"]+)\"").find(result.response.contentAsString)!!.groupValues[1]
        return Registered(id, email, assertNotNull(result.response.getCookie("vc_token")))
    }

    /** Status and error code of a protected API call, which is what an account being blocked looks like to a client. */
    private fun access(user: Registered): Pair<Int, String?> {
        val result = mvc.get("/api/v1/projects") { cookie(user.token) }.andReturn()
        return result.response.status to Regex("\"code\":\"([^\"]+)\"").find(result.response.contentAsString)?.groupValues?.get(1)
    }

    private fun account(user: Registered): String =
        mvc.get("/api/v1/me/account") { cookie(user.token) }.andExpect { status { isOk() } }.andReturn().response.contentAsString

    private fun adminPost(path: String, vararg params: Pair<String, String>): MvcResult = mvc.post(path) {
        with(adminPort); with(csrf())
        this.session = this@OnboardingBillingIntegrationTest.session
        header("Referer", "http://localhost:$ADMIN_PORT/admin/billing")
        params.forEach { (name, value) -> param(name, value) }
    }.andReturn()

    private fun MvcResult.succeeded(): MvcResult = apply {
        assertEquals(302, response.status, response.contentAsString)
        assertNull(flashMap["flashError"], "refused: ${flashMap["flashError"]}")
    }

    private fun MvcResult.refusedWith(fragment: String) {
        val message = flashMap["flashError"]?.toString()
        assertTrue(message != null && fragment in message, "expected a refusal mentioning '$fragment' but got: $message")
    }

    private fun adminPage(path: String): String =
        mvc.get(path) { with(adminPort); this.session = this@OnboardingBillingIntegrationTest.session }
            .andExpect { status { isOk() } }.andReturn().response.contentAsString

    private fun companyIdOf(user: Registered): String =
        jdbc.queryForObject("SELECT organization_id FROM users WHERE id = ?", String::class.java, user.id)!!

    private fun createPlan(audience: String, price: String): String {
        val code = "PLAN-${UUID.randomUUID().toString().take(8).uppercase()}"
        adminPost("/admin/billing/plans", "code" to code, "name" to "Standard", "audience" to audience, "price" to price).succeeded()
        return jdbc.queryForObject("SELECT id FROM plans WHERE code = ?", String::class.java, code)!!
    }

    private fun subscribe(subject: String, planId: String): String {
        val result = adminPost("/admin/billing/subscriptions", "subject" to subject, "planId" to planId).succeeded()
        return assertNotNull(result.response.redirectedUrl).substringAfterLast('/')
    }

    @Test
    fun `a company is approved as a whole and a person can be decided on individually`() {
        val founder = register(companyName = "Acme Earthworks")
        val engineer = register()

        // Both can sign in and see why they are waiting, but nothing else.
        assertEquals(403 to "AUTH_008", access(founder))
        assertEquals(403 to "AUTH_008", access(engineer))
        assertTrue("\"approvalStatus\":\"PENDING\"" in account(founder) && "\"canUsePlatform\":false" in account(founder))
        assertTrue("\"company\":\"Acme Earthworks\"" in account(founder))

        val companyId = companyIdOf(founder)
        adminPage("/admin/approvals").let {
            assertTrue("Acme Earthworks" in it)
            assertTrue("class=\"pill warn\">Pending" in it, "a pending status must be shown in the warning colour")
        }
        assertTrue(engineer.email in adminPage("/admin/approvals?tab=individuals"))

        // Rejecting needs a reason.
        adminPost("/admin/people/${engineer.id}/decision", "status" to "REJECTED").refusedWith("reason")

        // Approving the company lets in the people waiting inside it; the individual is unaffected.
        adminPost("/admin/companies/$companyId/decision", "status" to "APPROVED", "includeMembers" to "true").succeeded()
        assertEquals(200 to null, access(founder))
        assertEquals(403 to "AUTH_008", access(engineer))

        adminPost("/admin/people/${engineer.id}/decision", "status" to "APPROVED").succeeded()
        assertEquals(200 to null, access(engineer))

        // Suspending the company blocks its people again, whatever their own status.
        adminPost("/admin/companies/$companyId/decision", "status" to "SUSPENDED", "note" to "Contract dispute").succeeded()
        assertEquals(403 to "AUTH_008", access(founder))
        assertTrue("Acme Earthworks has been suspended" in account(founder))
        adminPost("/admin/companies/$companyId/decision", "status" to "APPROVED").succeeded()

        // One person in an approved company can still be suspended alone.
        adminPost("/admin/people/${founder.id}/decision", "status" to "SUSPENDED", "note" to "Left the company").succeeded()
        assertEquals(403 to "AUTH_008", access(founder))
    }

    @Test
    fun `an account on a plan has access only while the monthly amount is paid`() {
        val founder = register(companyName = "Paywall Constructions")
        val companyId = companyIdOf(founder)
        adminPost("/admin/companies/$companyId/decision", "status" to "APPROVED", "includeMembers" to "true").succeeded()
        assertEquals(200 to null, access(founder))  // approved and not on any plan: nothing to pay

        val planId = createPlan("COMPANY", "5000")
        val subscriptionId = subscribe("ORGANIZATION:$companyId", planId)

        // On a plan now, so access waits for the first payment.
        assertEquals(402 to "AUTH_009", access(founder))
        account(founder).let {
            assertTrue("\"subscriptionStanding\":\"AWAITING_PAYMENT\"" in it, it)
            assertTrue("\"amountDue\":{\"amountMinor\":500000,\"currency\":\"INR\"}" in it, it)
        }

        val payments = "/admin/billing/subscriptions/$subscriptionId/payments"
        // Too little for the months claimed, and a payment nobody could trace, are both refused.
        adminPost(payments, "months" to "3", "amount" to "5000", "method" to "UPI", "reference" to "UTR1").refusedWith("not enough")
        adminPost(payments, "months" to "1", "amount" to "5000", "method" to "BANK_TRANSFER").refusedWith("reference")
        assertEquals(402 to "AUTH_009", access(founder))

        adminPost(payments, "months" to "1", "amount" to "5,000", "method" to "UPI", "reference" to "UTR-778812").succeeded()
        assertEquals(200 to null, access(founder))
        val paidUntil = LocalDate.now().plusMonths(1).minusDays(1)
        assertTrue("\"subscriptionStanding\":\"PAID\"" in account(founder) && "\"paidUntil\":\"$paidUntil\"" in account(founder))

        // A further payment extends the paid period rather than overlapping it.
        adminPost(payments, "months" to "3", "amount" to "15000", "method" to "CHEQUE", "reference" to "CHQ-0042").succeeded()
        assertTrue("\"paidUntil\":\"${paidUntil.plusMonths(3)}\"" in account(founder), account(founder))

        // Lapsing: a few days late is tolerated, beyond the grace period access closes.
        fun setPaidUntil(date: LocalDate) = jdbc.update("UPDATE subscriptions SET paid_until = ? WHERE id = ?", date.toString(), subscriptionId)
        setPaidUntil(LocalDate.now().minusDays(2))
        assertEquals(200 to null, access(founder))
        assertTrue("\"subscriptionStanding\":\"GRACE\"" in account(founder))
        setPaidUntil(LocalDate.now().minusDays(30))
        assertEquals(402 to "AUTH_009", access(founder))
        assertTrue("\"subscriptionStanding\":\"OVERDUE\"" in account(founder))

        // Paying after a lapse starts the new period today; the locked-out days are not charged.
        adminPost(payments, "months" to "1", "amount" to "5000", "method" to "UPI", "reference" to "UTR-990001").succeeded()
        assertEquals(200 to null, access(founder))
        assertTrue("\"paidUntil\":\"$paidUntil\"" in account(founder))

        // Suspension and cancellation close access even when paid; resuming reopens it.
        val status = "/admin/billing/subscriptions/$subscriptionId/status"
        adminPost(status, "status" to "SUSPENDED").succeeded()
        assertEquals(402 to "AUTH_009", access(founder))
        adminPost(status, "status" to "ACTIVE").succeeded()
        assertEquals(200 to null, access(founder))
        adminPost(status, "status" to "CANCELLED").succeeded()
        assertEquals(402 to "AUTH_009", access(founder))
        adminPost(payments, "months" to "1", "amount" to "5000", "method" to "UPI", "reference" to "UTR-1").refusedWith("cancelled")

        // Three payments went through; the refused ones left nothing behind.
        assertEquals(3, jdbc.queryForObject("SELECT count(*) FROM payments WHERE subscription_id = ?", Int::class.java, subscriptionId))
    }

    @Test
    fun `recording the first payment can approve a waiting account, for a company or an individual`() {
        val founder = register(companyName = "Pay To Join Infra")
        val engineer = register()
        val companyPlan = createPlan("COMPANY", "8000")
        val individualPlan = createPlan("INDIVIDUAL", "500")

        // A plan is for companies or for individuals, not both.
        adminPost("/admin/billing/subscriptions", "subject" to "USER:${engineer.id}", "planId" to companyPlan).refusedWith("for companies")
        // Someone inside a company is covered by the company's subscription.
        adminPost("/admin/billing/subscriptions", "subject" to "USER:${founder.id}", "planId" to individualPlan).refusedWith("belongs to a company")

        val companySubscription = subscribe("ORGANIZATION:${companyIdOf(founder)}", companyPlan)
        val individualSubscription = subscribe("USER:${engineer.id}", individualPlan)
        assertEquals(403 to "AUTH_008", access(founder))

        // Paid, but deliberately not approved: still waiting.
        adminPost("/admin/billing/subscriptions/$individualSubscription/payments",
            "months" to "1", "amount" to "500", "method" to "CASH").succeeded()
        assertEquals(403 to "AUTH_008", access(engineer))
        adminPost("/admin/people/${engineer.id}/decision", "status" to "APPROVED").succeeded()
        assertEquals(200 to null, access(engineer))

        // Paid and approved in one step.
        adminPost("/admin/billing/subscriptions/$companySubscription/payments",
            "months" to "12", "amount" to "96000", "method" to "BANK_TRANSFER", "reference" to "NEFT-551", "approveAccount" to "true").succeeded()
        assertEquals(200 to null, access(founder))

        // A waiver records no money and needs a reason.
        val waiver = "/admin/billing/subscriptions/$individualSubscription/payments"
        adminPost(waiver, "months" to "1", "amount" to "0", "method" to "WAIVER").refusedWith("why")
        adminPost(waiver, "months" to "1", "amount" to "0", "method" to "WAIVER", "note" to "Pilot partner").succeeded()
    }

    @Test
    fun `the platform administrator is never locked out and every new page renders`() {
        val founder = register(companyName = "Render Check Ltd")
        val companyId = companyIdOf(founder)
        val planId = createPlan("ANY", "1000")
        val subscriptionId = subscribe("ORGANIZATION:$companyId", planId)

        listOf("/admin", "/admin/approvals", "/admin/approvals?tab=individuals&show=all", "/admin/companies",
            "/admin/companies/new", "/admin/companies/$companyId", "/admin/users", "/admin/users/new", "/admin/users/${founder.id}",
            "/admin/roles/permissions", "/admin/billing", "/admin/billing?show=attention", "/admin/billing/plans",
            "/admin/billing/payments", "/admin/billing/subscriptions/$subscriptionId", "/admin/audit?entityType=SUBSCRIPTION")
            .forEach { path -> assertTrue(adminPage(path).contains("VendorConnect"), path) }

        // The waiting work is counted in the navigation.
        assertTrue(Regex("Approvals\\s*<span class=\"badge\">\\d+</span>").containsMatchIn(adminPage("/admin")))

        // An administrator-created user is approved from the start and can sign in to the API.
        val email = "made-${UUID.randomUUID()}@test.local"
        adminPost("/admin/users", "email" to email, "fullName" to "Made By Admin", "password" to "initial-password-1",
            "role" to "SUPERVISOR", "organizationId" to "").succeeded()
        val login = mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","password":"initial-password-1"}"""
        }.andReturn()
        mvc.get("/api/v1/projects") { cookie(assertNotNull(login.response.getCookie("vc_token"))) }.andExpect { status { isOk() } }

        // The administrator belongs to no company and is on no plan; with billing in force they still work.
        val adminLogin = mvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$ADMIN_EMAIL","password":"$ADMIN_PASSWORD"}"""
        }.andReturn()
        mvc.get("/api/v1/admin/roles") { cookie(assertNotNull(adminLogin.response.getCookie("vc_token"))) }.andExpect { status { isOk() } }
    }
}
