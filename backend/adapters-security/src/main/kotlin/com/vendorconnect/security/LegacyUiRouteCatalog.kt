package com.vendorconnect.security

import com.vendorconnect.domain.user.Permission
import com.vendorconnect.domain.user.UserRole
import org.springframework.stereotype.Component

data class UiRouteMapping(
    val path: String,
    val label: String,
    val icon: String,
    val requiredPermissions: Set<Permission>,
    val allowedRoles: Set<UserRole>,
    val sortOrder: Int
)

/**
 * Sidebar entries for the current role-named frontend routes (`/dashboard/<role>/...`), keyed by the
 * legacy `users.role`. Navigation only: it grants nothing. API access is decided by
 * [AccessControlInterceptor] from role assignments.
 *
 * To be replaced by data-driven navigation once the frontend moves to resource-based routes.
 */
@Component
class LegacyUiRouteCatalog {

    // Every navigation entry must point to a real Next.js App Router page.
    // Role-specific dashboard roots avoid sending one role into another role's workspace.
    private val routes = listOf(
        // Administrator
        UiRouteMapping("/dashboard/admin", "Dashboard", "LayoutDashboard", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.ADMIN), 1),
        UiRouteMapping("/dashboard/admin/projects", "Projects", "FolderGit2", setOf(Permission.MANAGE_PROJECTS), setOf(UserRole.ADMIN), 2),
        UiRouteMapping("/dashboard/admin/users", "User Management", "Users", setOf(Permission.MANAGE_USERS), setOf(UserRole.ADMIN), 3),
        UiRouteMapping("/dashboard/admin/machines", "Machines", "Truck", setOf(Permission.MANAGE_RESOURCES), setOf(UserRole.ADMIN), 4),
        UiRouteMapping("/dashboard/admin/analytics", "Analytics", "BarChart3", setOf(Permission.VIEW_REPORTS), setOf(UserRole.ADMIN), 5),
        UiRouteMapping("/dashboard/admin/reports", "Reports", "FileText", setOf(Permission.VIEW_REPORTS), setOf(UserRole.ADMIN), 6),
        UiRouteMapping("/dashboard/admin/activity", "Activity", "Clock", setOf(Permission.MANAGE_SYSTEM), setOf(UserRole.ADMIN), 7),

        // Project head / EPC manager
        UiRouteMapping("/dashboard/pm", "Dashboard", "LayoutDashboard", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 1),
        UiRouteMapping("/dashboard/pm/projects", "Projects", "FolderGit2", setOf(Permission.MANAGE_PROJECTS), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 2),
        UiRouteMapping("/dashboard/pm/bids", "Bids & Procurement", "Receipt", setOf(Permission.MANAGE_TENDERS), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 3),
        UiRouteMapping("/dashboard/pm/tasks", "Tasks", "CheckSquare", setOf(Permission.MANAGE_PROJECTS), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 4),
        UiRouteMapping("/dashboard/pm/materials", "Materials", "Boxes", setOf(Permission.MANAGE_RESOURCES), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 5),
        UiRouteMapping("/dashboard/pm/rentals", "Machines & Rentals", "Truck", setOf(Permission.MANAGE_RESOURCES), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 6),
        UiRouteMapping("/dashboard/pm/team", "Team", "Users", setOf(Permission.MANAGE_PROJECTS), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 7),
        UiRouteMapping("/dashboard/pm/reports", "Reports", "FileText", setOf(Permission.VIEW_REPORTS), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 8),
        UiRouteMapping("/dashboard/pm/chat", "Communication", "MessageSquare", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 9),
        UiRouteMapping("/dashboard/pm/settings", "Settings", "Settings", setOf(Permission.MANAGE_PROJECTS), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 10),
        UiRouteMapping("/dashboard/pm/governance", "Roles & Approvals", "Shield", setOf(Permission.MANAGE_USERS), setOf(UserRole.PROJECT_HEAD), 11),
        UiRouteMapping("/dashboard/pm/quality-commercial", "Quality & Commercial", "BarChart3", setOf(Permission.VIEW_REPORTS), setOf(UserRole.PROJECT_HEAD, UserRole.EPC_MANAGER), 12),

        // Supervisor
        UiRouteMapping("/dashboard/supervisor", "Dashboard", "LayoutDashboard", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.SUPERVISOR), 1),
        UiRouteMapping("/dashboard/supervisor/daily-plan", "Daily Plan", "Calendar", setOf(Permission.UPDATE_PROGRESS), setOf(UserRole.SUPERVISOR), 2),
        UiRouteMapping("/dashboard/supervisor/tasks", "Assigned Tasks", "CheckSquare", setOf(Permission.UPDATE_PROGRESS), setOf(UserRole.SUPERVISOR), 3),
        UiRouteMapping("/dashboard/supervisor/projects", "Projects", "FolderGit2", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.SUPERVISOR), 4),
        UiRouteMapping("/dashboard/supervisor/attendance", "Attendance", "Clock", setOf(Permission.UPDATE_PROGRESS), setOf(UserRole.SUPERVISOR), 5),
        UiRouteMapping("/dashboard/supervisor/reports", "Reports", "FileText", setOf(Permission.VIEW_REPORTS), setOf(UserRole.SUPERVISOR), 6),
        UiRouteMapping("/dashboard/supervisor/summary", "Site Summary", "BarChart3", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.SUPERVISOR), 7),
        UiRouteMapping("/dashboard/supervisor/settings", "Settings", "Settings", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.SUPERVISOR), 8),

        // Vendor
        UiRouteMapping("/dashboard/vendor", "Dashboard", "LayoutDashboard", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.VENDOR), 1),
        UiRouteMapping("/dashboard/vendor/fleet", "Fleet", "Truck", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.VENDOR), 2),
        UiRouteMapping("/dashboard/vendor/requests", "Requests", "FileText", setOf(Permission.SUBMIT_INVOICES), setOf(UserRole.VENDOR), 3),
        UiRouteMapping("/dashboard/vendor/bids", "Bids", "Receipt", setOf(Permission.SUBMIT_INVOICES), setOf(UserRole.VENDOR), 4),
        UiRouteMapping("/dashboard/vendor/rentals", "Rentals", "Briefcase", setOf(Permission.SUBMIT_INVOICES), setOf(UserRole.VENDOR), 5),
        UiRouteMapping("/dashboard/vendor/orders", "Orders", "Boxes", setOf(Permission.SUBMIT_INVOICES), setOf(UserRole.VENDOR), 6),
        UiRouteMapping("/dashboard/vendor/inventory", "Inventory", "Boxes", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.VENDOR), 7),
        UiRouteMapping("/dashboard/vendor/billing", "Billing", "DollarSign", setOf(Permission.SUBMIT_INVOICES), setOf(UserRole.VENDOR), 8),
        UiRouteMapping("/dashboard/vendor/earnings", "Earnings", "BarChart3", setOf(Permission.SUBMIT_INVOICES), setOf(UserRole.VENDOR), 9),
        UiRouteMapping("/dashboard/vendor/performance", "Performance", "BarChart3", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.VENDOR), 10),

        // Specialist delivery roles represented in the redesign references
        UiRouteMapping("/dashboard/consultant", "My Desk", "ClipboardCheck", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.CONSULTANT), 1),
        UiRouteMapping("/dashboard/contractor", "Contractor Dashboard", "HardHat", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.CONTRACTOR), 1),
        UiRouteMapping("/dashboard/subcontractor", "My Work", "Briefcase", setOf(Permission.VIEW_DASHBOARD), setOf(UserRole.SUBCONTRACTOR), 1)
    )

    fun getAccessibleUiRoutes(role: UserRole): List<UiRouteMapping> =
        routes
            .filter { route -> role in route.allowedRoles && route.requiredPermissions.any(role.permissions::contains) }
            .sortedBy { it.sortOrder }

    fun getAllUiRoutes(): List<UiRouteMapping> = routes.sortedBy { it.sortOrder }
}
