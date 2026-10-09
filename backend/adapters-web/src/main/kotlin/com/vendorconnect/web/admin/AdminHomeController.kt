package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.AuditLogPort
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.application.usecase.project.ProjectStructureUseCase
import com.vendorconnect.application.usecase.project.ProjectUseCase
import com.vendorconnect.domain.project.PackageStatus
import com.vendorconnect.domain.project.ProjectStatus
import com.vendorconnect.domain.tender.TenderStatus
import com.vendorconnect.application.usecase.access.AssignmentAdminUseCase
import com.vendorconnect.application.usecase.access.RoleAdminUseCase
import com.vendorconnect.application.usecase.account.BillingUseCase
import com.vendorconnect.application.usecase.account.OnboardingUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.access.AssignmentStatus
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.account.Standing
import com.vendorconnect.security.Authenticated
import com.vendorconnect.security.PublicEndpoint
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

/** Sign-in page, overview and audit log of the admin console. */
@Controller
class AdminHomeController(
    private val users: UserUseCase,
    private val roles: RoleAdminUseCase,
    private val assignments: AssignmentAdminUseCase,
    private val auditLog: AuditLogPort,
    private val onboarding: OnboardingUseCase,
    private val billing: BillingUseCase,
    private val projects: ProjectUseCase,
    private val structure: ProjectStructureUseCase,
    private val tenders: TenderRepositoryPort
) {

    data class AuditRow(val at: String, val actor: String, val action: String, val entityType: String, val entityId: String, val summary: String)

    /** The form posts to the same path; Spring Security handles that, not a controller. */
    @GetMapping("/admin/login")
    @PublicEndpoint
    fun login(): String = "admin/login"

    @GetMapping("/admin")
    @Authenticated
    fun overview(model: Model): String {
        // Sections are filled only for what the signed-in administrator may see; the template checks `perms`.
        val perms = model.getAttribute("perms") as? Set<*> ?: emptySet<String>()

        if (Permissions.ADMIN_USER_MANAGE in perms) {
            val all = users.listAll()
            model.addAttribute("userCount", all.size)
            model.addAttribute("activeUserCount", all.count { it.isActive })
        }
        if (Permissions.ADMIN_ROLE_MANAGE in perms) {
            val all = roles.list()
            model.addAttribute("roleCount", all.size)
            model.addAttribute("customRoleCount", all.count { !it.isSystem })
        }
        if (Permissions.ADMIN_ASSIGNMENT_MANAGE in perms) {
            val all = assignments.list(null, null, null)
            val soon = LocalDate.now().plusDays(EXPIRY_WARNING_DAYS)
            model.addAttribute("usableAssignmentCount", all.count { it.usable })
            model.addAttribute("expiringCount", all.count { it.usable && it.assignment.validUntil?.isBefore(soon) == true })
            model.addAttribute("suspendedCount", all.count { it.assignment.status == AssignmentStatus.SUSPENDED })
            if (Permissions.ADMIN_USER_MANAGE in perms) {
                val covered = all.filter { it.usable }.mapTo(mutableSetOf()) { it.assignment.userId }
                model.addAttribute("usersWithoutAccess", users.listAll().count { it.isActive && it.id !in covered })
            }
        }
        if (Permissions.ADMIN_APPROVAL_MANAGE in perms) {
            val companies = onboarding.companies()
            model.addAttribute("companyCount", companies.size)
            model.addAttribute("pendingCompanyCount", companies.count { it.company.approvalStatus == ApprovalStatus.PENDING })
            model.addAttribute("pendingPeopleCount", users.listAll().count { it.approvalStatus == ApprovalStatus.PENDING })
        }
        if (Permissions.ADMIN_BILLING_MANAGE in perms) {
            val subscriptions = billing.subscriptions()
            model.addAttribute("subscriptionCount", subscriptions.size)
            model.addAttribute("paidCount", subscriptions.count { it.standing == Standing.PAID })
            model.addAttribute("awaitingPaymentCount", subscriptions.count { it.standing == Standing.AWAITING_PAYMENT })
            model.addAttribute("overdueCount", subscriptions.count { it.standing == Standing.OVERDUE || it.standing == Standing.GRACE })
            model.addAttribute("recurring", billing.monthlyRecurring().values.joinToString(" + ") { it.display() }.ifEmpty { "—" })
        }
        if (Permissions.PROJECT_READ in perms) {
            val all = projects.listAll()
            model.addAttribute("projectCount", all.size)
            model.addAttribute("activeProjectCount", all.count { it.status == ProjectStatus.IN_PROGRESS })
            model.addAttribute("onHoldProjectCount", all.count { it.status == ProjectStatus.ON_HOLD })
            model.addAttribute("delayedPackageCount", all.sumOf { p -> structure.workPackages(p.id).count { it.status == PackageStatus.DELAYED.name } })
        }
        if (Permissions.TENDER_READ in perms) {
            val all = tenders.findAll()
            model.addAttribute("openTenderCount", all.count { it.status == TenderStatus.PUBLISHED })
            model.addAttribute("draftTenderCount", all.count { it.status == TenderStatus.DRAFT })
        }
        if (Permissions.ADMIN_AUDIT_READ in perms) {
            model.addAttribute("recent", auditRows(null, null, RECENT_ON_OVERVIEW))
        }
        return "admin/overview"
    }

    @GetMapping("/admin/audit")
    @RequirePermission(Permissions.ADMIN_AUDIT_READ)
    fun audit(
        @RequestParam(required = false) entityType: String?,
        @RequestParam(required = false) actor: String?,
        model: Model
    ): String {
        val type = entityType.blankToNull()?.takeIf { it in ENTITY_TYPES }
        val actorId = actor.toUuidOrNull()
        model.addAttribute("rows", auditRows(type, actorId, AUDIT_PAGE_SIZE))
        model.addAttribute("entityTypes", ENTITY_TYPES)
        model.addAttribute("entityType", type)
        model.addAttribute("actor", actorId?.toString())
        model.addAttribute("limit", AUDIT_PAGE_SIZE)
        return "admin/audit"
    }

    private fun auditRows(entityType: String?, actorId: UUID?, limit: Int): List<AuditRow> {
        val emails = users.listAll().associate { it.id to it.email }
        return auditLog.findRecent(entityType, null, actorId, limit).map {
            AuditRow(
                at = TIMESTAMP.format(it.occurredAt.atZone(ZoneId.systemDefault())),
                actor = it.actorUserId?.let { id -> emails[id] ?: id.toString() } ?: "system",
                action = it.action,
                entityType = it.entityType,
                entityId = it.entityId,
                summary = it.summary
            )
        }
    }

    private companion object {
        const val EXPIRY_WARNING_DAYS = 30L
        const val RECENT_ON_OVERVIEW = 10
        const val AUDIT_PAGE_SIZE = 200
        val ENTITY_TYPES = listOf("USER", "COMPANY", "ROLE", "ROLE_ASSIGNMENT", "PLAN", "SUBSCRIPTION", "QUALIFICATION", "SETTING", "PROJECT", "TENDER")
        val TIMESTAMP: DateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm:ss")
    }
}
