package com.vendorconnect.domain.partner

enum class FieldType { TEXT, TEXTAREA, EMAIL, PHONE, NUMBER, DATE, SELECT, MULTI_SELECT, YES_NO, DOCUMENT }

/** Makes a field required only when another field of the application has a given answer. */
data class RequiredWhen(val field: String, val equals: String)

data class FieldDef(
    val key: String,
    val label: String,
    val type: FieldType,
    val required: Boolean = true,
    val options: List<String> = emptyList(),
    val hint: String? = null,
    /** Encrypted at rest and never sent back in full; clients get a masked form. */
    val sensitive: Boolean = false,
    val pattern: Regex? = null,
    val patternMessage: String? = null,
    /** Identifiers such as PAN are compared and stored in capitals. */
    val upperCase: Boolean = false,
    val requiredWhen: RequiredWhen? = null
)

data class StepDef(val key: String, val title: String, val shortTitle: String, val intro: String, val fields: List<FieldDef>)

/**
 * What a partner is asked when they apply for qualification. It lives in code for now so that
 * the form, its validation and the "what is still missing" list are always in step; clients
 * render from this definition rather than hard-coding the form.
 *
 * Written for India (PAN, GSTIN, IFSC). A second country would be a second template.
 */
object QualificationTemplate {
    const val VERSION = 1

    private const val YES = "YES"

    val steps: List<StepDef> = listOf(
        StepDef("company", "Company identity", "Company", "Your legal entity, as on its official documents.", listOf(
            FieldDef("legalName", "Legal name of entity", FieldType.TEXT),
            FieldDef("entityType", "Entity type", FieldType.SELECT,
                options = listOf("Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited", "Government", "Other")),
            FieldDef("incorporationDate", "Incorporation date", FieldType.DATE),
            FieldDef("country", "Country of incorporation", FieldType.SELECT, options = listOf("India")),
            FieldDef("pan", "PAN", FieldType.TEXT, sensitive = true, upperCase = true,
                pattern = Regex("^[A-Z]{5}[0-9]{4}[A-Z]$"), patternMessage = "A PAN is 5 letters, 4 digits and a letter, like ABCDE1234F"),
            FieldDef("registeredAddress", "Registered address", FieldType.TEXTAREA),
            FieldDef("registrationDocument", "Registration document", FieldType.DOCUMENT,
                hint = "Certificate of incorporation or partnership deed. A clear, legible copy.")
        )),
        StepDef("capabilities", "Capabilities and contacts", "Capabilities", "What you do, where, and who we should talk to.", listOf(
            FieldDef("tradeCategories", "Trade categories", FieldType.MULTI_SELECT,
                options = listOf("Earthworks", "Site clearing", "Civil structures", "Piling", "Electrical", "Signalling & telecom",
                    "Mechanical", "Plant hire", "Material supply")),
            FieldDef("serviceRegions", "Service regions", FieldType.MULTI_SELECT,
                options = listOf("National", "North India", "South India", "East India", "West India", "Central India")),
            FieldDef("primaryContactName", "Primary contact name", FieldType.TEXT),
            FieldDef("primaryContactEmail", "Primary contact email", FieldType.EMAIL),
            FieldDef("primaryContactPhone", "Primary contact phone", FieldType.PHONE),
            FieldDef("secondaryContactName", "Second contact name", FieldType.TEXT, required = false),
            FieldDef("secondaryContactPhone", "Second contact phone", FieldType.PHONE, required = false)
        )),
        StepDef("banking", "Banking and GST", "Banking & GST", "Bank details are visible to authorised finance reviewers only.", listOf(
            FieldDef("accountHolderName", "Account holder name", FieldType.TEXT),
            FieldDef("accountNumber", "Account number", FieldType.TEXT, sensitive = true,
                pattern = Regex("^[0-9]{9,18}$"), patternMessage = "An account number is 9 to 18 digits"),
            FieldDef("ifsc", "IFSC code", FieldType.TEXT, upperCase = true,
                pattern = Regex("^[A-Z]{4}0[A-Z0-9]{6}$"), patternMessage = "An IFSC is 11 characters, like HDFC0001234"),
            FieldDef("cancelledCheque", "Cancelled cheque", FieldType.DOCUMENT,
                hint = "With the account number and IFSC visible."),
            FieldDef("gstApplicable", "Is GST registration applicable to your business?", FieldType.YES_NO),
            FieldDef("gstin", "GST registration number", FieldType.TEXT, upperCase = true,
                pattern = Regex("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$"),
                patternMessage = "A GSTIN is 15 characters, like 27ABCDE1234F1Z5",
                requiredWhen = RequiredWhen("gstApplicable", YES)),
            FieldDef("gstCertificate", "GST registration certificate", FieldType.DOCUMENT,
                requiredWhen = RequiredWhen("gstApplicable", YES))
        )),
        StepDef("financial", "Financial capacity", "Financial", "Your latest audited financial year. Amounts in ₹ lakhs.", listOf(
            FieldDef("financialYear", "Financial year", FieldType.SELECT, options = listOf("2025-26", "2024-25", "2023-24")),
            FieldDef("annualTurnoverLakhs", "Annual revenue (turnover), ₹ lakhs", FieldType.NUMBER,
                hint = "Total operating revenue for the selected year."),
            FieldDef("netProfitLakhs", "Net profit after tax, ₹ lakhs", FieldType.NUMBER, hint = "As per audited statements."),
            FieldDef("auditedStatements", "Audited financial statements", FieldType.DOCUMENT)
        )),
        StepDef("technical", "Technical capacity", "Technical", "Past work, people and equipment.", listOf(
            FieldDef("largestProjectName", "Largest completed contract: project name", FieldType.TEXT),
            FieldDef("largestProjectClient", "Client", FieldType.TEXT),
            FieldDef("largestProjectValueLakhs", "Contract value, ₹ lakhs", FieldType.NUMBER),
            FieldDef("largestProjectYear", "Completion year", FieldType.NUMBER),
            FieldDef("totalManpower", "Total manpower", FieldType.NUMBER),
            FieldDef("engineersSupervisors", "Engineers and supervisors", FieldType.NUMBER),
            FieldDef("equipment", "Key equipment owned or hired", FieldType.TEXTAREA, required = false,
                hint = "For example: 12 excavators (20T) owned, 25 tipper trucks hired."),
            FieldDef("experienceCertificate", "Experience certificate", FieldType.DOCUMENT)
        )),
        StepDef("hse", "Health, safety and insurance", "HSE", "How you keep people safe on site.", listOf(
            FieldDef("safetyPolicy", "Do you have a written site safety policy?", FieldType.YES_NO),
            FieldDef("safetyPolicyDocument", "Site safety policy", FieldType.DOCUMENT, requiredWhen = RequiredWhen("safetyPolicy", YES)),
            FieldDef("safetySupervisor", "Is a safety supervisor assigned to every project?", FieldType.YES_NO),
            FieldDef("lostTimeIncidents", "Lost-time incidents in the last 3 years", FieldType.NUMBER),
            FieldDef("insuranceCover", "Do you hold workmen's compensation or equivalent insurance?", FieldType.YES_NO),
            FieldDef("insurancePolicy", "Insurance policy", FieldType.DOCUMENT, requiredWhen = RequiredWhen("insuranceCover", YES))
        ))
    )

    private val stepsByKey = steps.associateBy { it.key }
    private val fieldsByKey = steps.flatMap { it.fields }.associateBy { it.key }

    fun step(key: String): StepDef? = stepsByKey[key]

    fun field(key: String): FieldDef? = fieldsByKey[key]
}
