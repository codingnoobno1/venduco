package com.vendorconnect.domain.access

/**
 * How much authority a permission carries. An assignment's [AccessLevel] caps the kinds it may use,
 * so the same role can be granted read-only on one project and in full on another.
 */
enum class PermissionKind { READ, WRITE, DECIDE }

data class PermissionDef(val key: String, val kind: PermissionKind, val description: String, val sensitive: Boolean = false) {
    val resource: String get() = key.substringBefore(':')
    val action: String get() = key.substringAfter(':')
}

/**
 * The permission catalogue. Permissions are defined in code because code is what checks them;
 * the database only stores which roles hold which keys.
 */
object Permissions {
    const val PORTFOLIO_READ = "portfolio:read"
    const val PROJECT_READ = "project:read"
    const val PROJECT_CREATE = "project:create"
    const val PROJECT_UPDATE = "project:update"
    const val PACKAGE_READ = "package:read"
    const val PACKAGE_UPDATE = "package:update"
    const val SECTION_READ = "section:read"
    const val SECTION_UPDATE = "section:update"
    const val PROGRESS_READ = "progress:read"
    const val PROGRESS_SUBMIT = "progress:submit"
    const val PROGRESS_VERIFY = "progress:verify"
    const val DRAWING_READ = "drawing:read"
    const val DRAWING_SUBMIT = "drawing:submit"
    const val DRAWING_APPROVE = "drawing:approve"
    const val INSPECTION_READ = "inspection:read"
    const val INSPECTION_REQUEST = "inspection:request"
    const val INSPECTION_DECIDE = "inspection:decide"
    const val ISSUE_READ = "issue:read"
    const val ISSUE_CREATE = "issue:create"
    const val ISSUE_RESOLVE = "issue:resolve"
    const val RESOURCE_READ = "resource:read"
    const val RESOURCE_ALLOCATE = "resource:allocate"
    const val APPROVAL_READ = "approval:read"
    const val APPROVAL_DECIDE = "approval:decide"
    const val FINANCE_READ = "finance:read"
    const val FINANCE_SANCTION = "finance:sanction"
    const val TEAM_READ = "team:read"
    const val TEAM_ASSIGN = "team:assign"
    const val PARTNER_READ = "partner:read"
    const val PARTNER_UPDATE = "partner:update"
    const val PARTNER_BANK_READ = "partner.bank:read"
    const val QUALIFICATION_READ = "qualification:read"
    const val QUALIFICATION_SUBMIT = "qualification:submit"
    const val QUALIFICATION_REVIEW = "qualification:review"
    const val QUALIFICATION_DECIDE = "qualification:decide"
    const val TENDER_READ = "tender:read"
    const val TENDER_MANAGE = "tender:manage"
    const val BID_SUBMIT = "bid:submit"
    const val BID_EVALUATE = "bid:evaluate"
    const val HIRING_READ = "hiring:read"
    const val HIRING_MANAGE = "hiring:manage"
    const val HIRING_AWARD = "hiring:award"
    const val FLEET_READ = "fleet:read"
    const val FLEET_READ_ALL = "fleet:read-all"
    const val FLEET_MANAGE = "fleet:manage"
    const val REPORT_READ = "report:read"
    const val DASHBOARD_READ = "dashboard:read"
    const val ADMIN_USER_MANAGE = "admin.user:manage"
    const val ADMIN_ROLE_MANAGE = "admin.role:manage"
    const val ADMIN_ASSIGNMENT_MANAGE = "admin.assignment:manage"
    const val ADMIN_AUDIT_READ = "admin.audit:read"
    const val ADMIN_APPROVAL_MANAGE = "admin.approval:manage"
    const val ADMIN_BILLING_MANAGE = "admin.billing:manage"
    const val ADMIN_SETTINGS_MANAGE = "admin.settings:manage"

    val all: List<PermissionDef> = listOf(
        read(PORTFOLIO_READ, "View the portfolio across projects"),
        read(PROJECT_READ, "View projects"),
        write(PROJECT_CREATE, "Create projects"),
        write(PROJECT_UPDATE, "Edit project details"),
        read(PACKAGE_READ, "View work packages"),
        write(PACKAGE_UPDATE, "Edit work packages"),
        read(SECTION_READ, "View sections and work fronts"),
        write(SECTION_UPDATE, "Edit sections and work fronts"),
        read(PROGRESS_READ, "View progress and quantities"),
        write(PROGRESS_SUBMIT, "Submit daily progress"),
        decide(PROGRESS_VERIFY, "Verify submitted progress"),
        read(DRAWING_READ, "View drawings"),
        write(DRAWING_SUBMIT, "Submit drawings and revisions"),
        decide(DRAWING_APPROVE, "Approve drawings"),
        read(INSPECTION_READ, "View inspections"),
        write(INSPECTION_REQUEST, "Request inspections"),
        decide(INSPECTION_DECIDE, "Approve or reject inspections"),
        read(ISSUE_READ, "View issues and blockers"),
        write(ISSUE_CREATE, "Raise issues and blockers"),
        decide(ISSUE_RESOLVE, "Resolve issues and blockers"),
        read(RESOURCE_READ, "View manpower and equipment"),
        write(RESOURCE_ALLOCATE, "Allocate manpower and equipment"),
        read(APPROVAL_READ, "View approvals"),
        decide(APPROVAL_DECIDE, "Decide approvals"),
        read(FINANCE_READ, "View financial figures"),
        decide(FINANCE_SANCTION, "Sanction funds"),
        read(TEAM_READ, "View the project team"),
        decide(TEAM_ASSIGN, "Invite members and assign project roles"),
        read(PARTNER_READ, "View partners"),
        write(PARTNER_UPDATE, "Edit partner records"),
        read(PARTNER_BANK_READ, "View unmasked partner bank details", sensitive = true),
        read(QUALIFICATION_READ, "View qualification submissions"),
        write(QUALIFICATION_SUBMIT, "Submit a qualification application"),
        write(QUALIFICATION_REVIEW, "Review a qualification track"),
        decide(QUALIFICATION_DECIDE, "Approve or reject a qualification"),
        read(TENDER_READ, "View tenders"),
        write(TENDER_MANAGE, "Create, edit and publish tenders"),
        write(BID_SUBMIT, "Submit bids"),
        decide(BID_EVALUATE, "Evaluate bids"),
        read(HIRING_READ, "View partner hiring requisitions"),
        write(HIRING_MANAGE, "Manage requisitions and shortlists"),
        decide(HIRING_AWARD, "Recommend or approve an award"),
        read(FLEET_READ, "View machines in the fleet register"),
        read(FLEET_READ_ALL, "View every owner's machines, not only your own"),
        write(FLEET_MANAGE, "Add, edit and remove your own machines"),
        read(REPORT_READ, "View reports"),
        read(DASHBOARD_READ, "View dashboards"),
        decide(ADMIN_USER_MANAGE, "Manage user accounts", sensitive = true),
        decide(ADMIN_ROLE_MANAGE, "Manage roles and their permissions", sensitive = true),
        decide(ADMIN_ASSIGNMENT_MANAGE, "Manage role assignments", sensitive = true),
        read(ADMIN_AUDIT_READ, "View the audit log", sensitive = true),
        decide(ADMIN_APPROVAL_MANAGE, "Approve, reject and suspend companies and individuals", sensitive = true),
        decide(ADMIN_BILLING_MANAGE, "Manage plans, subscriptions and record payments", sensitive = true),
        decide(ADMIN_SETTINGS_MANAGE, "Change platform settings: automatic approval and payment enforcement", sensitive = true)
    )

    private val byKey: Map<String, PermissionDef> = all.associateBy { it.key }

    val keys: Set<String> get() = byKey.keys

    fun isKnown(key: String): Boolean = key in byKey

    fun unknown(keys: Collection<String>): List<String> = keys.filterNot(::isKnown).sorted()

    /** The subset of [keys] an assignment at [level] may actually use. Unknown keys are dropped. */
    fun effective(keys: Set<String>, level: AccessLevel): Set<String> =
        keys.filterTo(sortedSetOf()) { key -> byKey[key]?.let { it.kind in level.allowedKinds } == true }

    private fun read(key: String, description: String, sensitive: Boolean = false) =
        PermissionDef(key, PermissionKind.READ, description, sensitive)

    private fun write(key: String, description: String) = PermissionDef(key, PermissionKind.WRITE, description)

    private fun decide(key: String, description: String, sensitive: Boolean = false) =
        PermissionDef(key, PermissionKind.DECIDE, description, sensitive)
}
