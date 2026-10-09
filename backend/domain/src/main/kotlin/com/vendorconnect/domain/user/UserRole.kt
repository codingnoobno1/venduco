package com.vendorconnect.domain.user

/**
 * RBAC roles for the infrastructure corridor domain.
 * Each role has a set of permissions.
 */
enum class UserRole(val permissions: Set<Permission>) {
    ADMIN(Permission.entries.toSet()),

    PROJECT_HEAD(setOf(
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_RESOURCES,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_TENDERS,
        Permission.MANAGE_USERS,
        Permission.VIEW_AI_ANALYSIS
    )),

    EPC_MANAGER(setOf(
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_RESOURCES,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_TENDERS,
        Permission.VIEW_AI_ANALYSIS
    )),

    SUPERVISOR(setOf(
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_REPORTS,
        Permission.UPDATE_PROGRESS,
        Permission.REPORT_ISSUES
    )),

    VENDOR(setOf(
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_ASSIGNED_TASKS,
        Permission.UPDATE_PROGRESS,
        Permission.SUBMIT_INVOICES
    )),

    CONSULTANT(setOf(
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_REPORTS,
        Permission.UPDATE_PROGRESS,
        Permission.REPORT_ISSUES
    )),

    CONTRACTOR(setOf(
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_RESOURCES,
        Permission.VIEW_REPORTS,
        Permission.UPDATE_PROGRESS,
        Permission.REPORT_ISSUES,
        Permission.SUBMIT_INVOICES
    )),

    SUBCONTRACTOR(setOf(
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_ASSIGNED_TASKS,
        Permission.UPDATE_PROGRESS,
        Permission.REPORT_ISSUES,
        Permission.SUBMIT_INVOICES
    ))
}

enum class Permission {
    VIEW_DASHBOARD,
    MANAGE_PROJECTS,
    MANAGE_RESOURCES,
    VIEW_REPORTS,
    MANAGE_TENDERS,
    MANAGE_USERS,
    VIEW_AI_ANALYSIS,
    UPDATE_PROGRESS,
    REPORT_ISSUES,
    VIEW_ASSIGNED_TASKS,
    SUBMIT_INVOICES,
    MANAGE_SYSTEM
}
