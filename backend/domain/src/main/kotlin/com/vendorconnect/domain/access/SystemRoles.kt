package com.vendorconnect.domain.access

import com.vendorconnect.domain.access.Permissions as P
import com.vendorconnect.domain.user.UserRole
import java.util.UUID

/**
 * Built-in roles. They are written to the database at startup and are read-only there:
 * an administrator clones one to customise it. Ids are derived from the key so they are stable
 * across environments.
 */
object SystemRoles {
    const val PLATFORM_ADMIN = "PLATFORM_ADMIN"
    const val ONBOARDING_OFFICER = "ONBOARDING_OFFICER"
    const val BILLING_OFFICER = "BILLING_OFFICER"
    const val PROJECT_DIRECTOR = "PROJECT_DIRECTOR"
    const val PROJECT_MANAGER = "PROJECT_MANAGER"
    const val EPC_MANAGER = "EPC_MANAGER"
    const val CHIEF_ENGINEER = "CHIEF_ENGINEER"
    const val SECTION_ENGINEER = "SECTION_ENGINEER"
    const val SUPERVISOR = "SUPERVISOR"
    const val HIRING_MANAGER = "HIRING_MANAGER"
    const val PROCUREMENT_MANAGER = "PROCUREMENT_MANAGER"
    const val QUALIFICATION_REVIEWER = "QUALIFICATION_REVIEWER"
    const val FINANCE_REVIEWER = "FINANCE_REVIEWER"
    const val AUDITOR = "AUDITOR"
    const val CONSULTANT = "CONSULTANT"
    const val CONTRACTOR = "CONTRACTOR"
    const val SUBCONTRACTOR = "SUBCONTRACTOR"
    const val VENDOR = "VENDOR"

    fun idOf(key: String): UUID = UUID.nameUUIDFromBytes("vendorconnect:role:$key".toByteArray())

    private val siteRead = setOf(
        P.PROJECT_READ, P.PACKAGE_READ, P.SECTION_READ, P.PROGRESS_READ, P.DRAWING_READ,
        P.INSPECTION_READ, P.ISSUE_READ, P.RESOURCE_READ, P.DASHBOARD_READ
    )

    val all: List<Role> = listOf(
        role(PLATFORM_ADMIN, "Platform Administrator", Portal.ADMIN, ScopeLevel.PLATFORM,
            "Full access, including users, roles and assignments.", P.keys),

        role(ONBOARDING_OFFICER, "Onboarding Officer", Portal.ADMIN, ScopeLevel.PLATFORM,
            "Approves, rejects and suspends companies and individuals. Cannot change roles or billing.",
            setOf(P.ADMIN_APPROVAL_MANAGE, P.ADMIN_AUDIT_READ)),

        role(BILLING_OFFICER, "Billing Officer", Portal.ADMIN, ScopeLevel.PLATFORM,
            "Manages plans and subscriptions and records payments. Cannot approve accounts on their own authority.",
            setOf(P.ADMIN_BILLING_MANAGE, P.ADMIN_AUDIT_READ)),

        role(PROJECT_DIRECTOR, "Project Director", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Portfolio oversight and escalated decisions across the organisation's projects.",
            siteRead + setOf(P.PORTFOLIO_READ, P.APPROVAL_READ, P.APPROVAL_DECIDE, P.FINANCE_READ, P.FINANCE_SANCTION,
                P.TEAM_READ, P.PARTNER_READ, P.TENDER_READ, P.HIRING_READ, P.REPORT_READ, P.FLEET_READ, P.FLEET_READ_ALL)),

        role(PROJECT_MANAGER, "Project Manager", Portal.BUYER, ScopeLevel.PROJECT,
            "Runs delivery of a project: packages, approvals, team and tenders.",
            siteRead + setOf(P.PROJECT_CREATE, P.PROJECT_UPDATE, P.PACKAGE_UPDATE, P.SECTION_UPDATE, P.PROGRESS_VERIFY,
                P.DRAWING_APPROVE, P.ISSUE_CREATE, P.ISSUE_RESOLVE, P.RESOURCE_ALLOCATE, P.APPROVAL_READ,
                P.APPROVAL_DECIDE, P.FINANCE_READ, P.TEAM_READ, P.TEAM_ASSIGN, P.PARTNER_READ, P.TENDER_READ,
                P.TENDER_MANAGE, P.BID_EVALUATE, P.HIRING_READ, P.HIRING_AWARD, P.REPORT_READ, P.FLEET_READ, P.FLEET_READ_ALL)),

        role(EPC_MANAGER, "EPC Manager", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Manages the packages and tenders of an EPC contractor.",
            siteRead + setOf(P.PROJECT_CREATE, P.PROJECT_UPDATE, P.PACKAGE_UPDATE, P.PROGRESS_VERIFY, P.ISSUE_CREATE,
                P.RESOURCE_ALLOCATE, P.APPROVAL_READ, P.TENDER_READ, P.TENDER_MANAGE, P.BID_EVALUATE, P.REPORT_READ, P.FLEET_READ, P.FLEET_READ_ALL)),

        role(CHIEF_ENGINEER, "Chief Engineer", Portal.BUYER, ScopeLevel.DISCIPLINE,
            "Leads one discipline on a project. Clone per discipline to rename.",
            siteRead + setOf(P.PACKAGE_UPDATE, P.PROGRESS_VERIFY, P.DRAWING_APPROVE, P.INSPECTION_DECIDE,
                P.ISSUE_CREATE, P.ISSUE_RESOLVE, P.RESOURCE_ALLOCATE, P.APPROVAL_READ, P.APPROVAL_DECIDE, P.REPORT_READ)),

        role(SECTION_ENGINEER, "Section Engineer", Portal.BUYER, ScopeLevel.SECTION,
            "Runs daily work fronts on assigned sections.",
            siteRead + setOf(P.SECTION_UPDATE, P.PROGRESS_SUBMIT, P.DRAWING_SUBMIT, P.INSPECTION_REQUEST,
                P.ISSUE_CREATE, P.RESOURCE_ALLOCATE, P.APPROVAL_READ)),

        role(SUPERVISOR, "Site Supervisor", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Reports progress and issues from site.",
            siteRead + setOf(P.PROGRESS_SUBMIT, P.INSPECTION_REQUEST, P.ISSUE_CREATE, P.REPORT_READ)),

        role(HIRING_MANAGER, "Hiring Manager", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Sources, shortlists and recommends partners for packages.",
            setOf(P.PROJECT_READ, P.PACKAGE_READ, P.DASHBOARD_READ, P.PARTNER_READ, P.QUALIFICATION_READ,
                P.TENDER_READ, P.HIRING_READ, P.HIRING_MANAGE, P.REPORT_READ)),

        role(PROCUREMENT_MANAGER, "Procurement Manager", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Decides partner qualifications and awards.",
            setOf(P.PROJECT_READ, P.PACKAGE_READ, P.DASHBOARD_READ, P.PARTNER_READ, P.PARTNER_UPDATE,
                P.QUALIFICATION_READ, P.QUALIFICATION_DECIDE, P.TENDER_READ, P.TENDER_MANAGE, P.BID_EVALUATE,
                P.HIRING_READ, P.HIRING_AWARD, P.APPROVAL_READ, P.APPROVAL_DECIDE, P.REPORT_READ)),

        role(QUALIFICATION_REVIEWER, "Qualification Reviewer", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Reviews a compliance or technical track of partner qualifications.",
            setOf(P.DASHBOARD_READ, P.PARTNER_READ, P.QUALIFICATION_READ, P.QUALIFICATION_REVIEW)),

        role(FINANCE_REVIEWER, "Finance Reviewer", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Reviews the finance track of partner qualifications, including bank details.",
            setOf(P.DASHBOARD_READ, P.PARTNER_READ, P.PARTNER_BANK_READ, P.QUALIFICATION_READ, P.QUALIFICATION_REVIEW,
                P.FINANCE_READ)),

        role(AUDITOR, "Auditor (read-only)", Portal.BUYER, ScopeLevel.ORGANIZATION,
            "Read-only access for audit and monitoring.",
            siteRead + setOf(P.PORTFOLIO_READ, P.APPROVAL_READ, P.FINANCE_READ, P.TEAM_READ, P.PARTNER_READ,
                P.QUALIFICATION_READ, P.TENDER_READ, P.HIRING_READ, P.REPORT_READ)),

        role(CONSULTANT, "Consultant", Portal.PARTNER, ScopeLevel.ORGANIZATION,
            "Provides technical review on assigned scope.",
            siteRead + setOf(P.INSPECTION_DECIDE, P.ISSUE_CREATE, P.REPORT_READ)),

        role(CONTRACTOR, "Contractor", Portal.PARTNER, ScopeLevel.ORGANIZATION,
            "Delivers contract packages and manages subcontractors.",
            siteRead + setOf(P.PROGRESS_SUBMIT, P.PROGRESS_VERIFY, P.DRAWING_SUBMIT, P.INSPECTION_REQUEST,
                P.ISSUE_CREATE, P.RESOURCE_ALLOCATE, P.QUALIFICATION_SUBMIT, P.BID_SUBMIT, P.REPORT_READ, P.FLEET_READ, P.FLEET_MANAGE)),

        role(SUBCONTRACTOR, "Subcontractor", Portal.PARTNER, ScopeLevel.ORGANIZATION,
            "Performs assigned work and reports daily quantities.",
            setOf(P.PROJECT_READ, P.PACKAGE_READ, P.SECTION_READ, P.PROGRESS_READ, P.DRAWING_READ, P.DASHBOARD_READ,
                P.PROGRESS_SUBMIT, P.INSPECTION_REQUEST, P.ISSUE_CREATE, P.QUALIFICATION_SUBMIT, P.BID_SUBMIT, P.FLEET_READ, P.FLEET_MANAGE)),

        role(VENDOR, "Vendor", Portal.PARTNER, ScopeLevel.ORGANIZATION,
            "Supplies materials and equipment; applies for qualification and bids on tenders.",
            setOf(P.PROJECT_READ, P.DASHBOARD_READ, P.QUALIFICATION_SUBMIT, P.BID_SUBMIT, P.FLEET_READ, P.FLEET_MANAGE))
    )

    private val byKey = all.associateBy { it.key }

    fun byKey(key: String): Role = byKey.getValue(key)

    /** Bridge from the single `users.role` column to a system role, used until that column is retired. */
    fun forLegacy(role: UserRole): Role = byKey(
        when (role) {
            UserRole.ADMIN -> PLATFORM_ADMIN
            UserRole.PROJECT_HEAD -> PROJECT_MANAGER
            UserRole.EPC_MANAGER -> EPC_MANAGER
            UserRole.SUPERVISOR -> SUPERVISOR
            UserRole.VENDOR -> VENDOR
            UserRole.CONSULTANT -> CONSULTANT
            UserRole.CONTRACTOR -> CONTRACTOR
            UserRole.SUBCONTRACTOR -> SUBCONTRACTOR
        }
    )

    private fun role(key: String, name: String, portal: Portal, level: ScopeLevel, description: String, permissions: Set<String>) =
        Role(id = idOf(key), key = key, name = name, description = description, portal = portal, scopeLevel = level,
            isSystem = true, permissions = permissions)
}
