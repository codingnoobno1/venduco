package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.access.MyAccessUseCase
import com.vendorconnect.application.usecase.account.AccountStandingService
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.shared.AssignmentInvalidException
import com.vendorconnect.security.AccessControlInterceptor
import com.vendorconnect.security.Authenticated
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * The caller's own access: which assignments they hold, and what one of them allows.
 * Clients pick an assignment from `/context` and send its id as `X-VC-Assignment` on later calls.
 */
@RestController
@RequestMapping("/api/v1/me")
class MeController(
    private val myAccess: MyAccessUseCase,
    private val users: UserUseCase,
    private val standing: AccountStandingService
) {

    data class AccountResponse(
        val approvalStatus: String,
        val company: String?,
        val companyApprovalStatus: String?,
        val plan: String?,
        val monthlyPrice: MoneyDto?,
        val subscriptionStanding: String?,
        val paidUntil: String?,
        val amountDue: MoneyDto?,
        val canUsePlatform: Boolean,
        val blockedReason: String?
    )

    data class MyAssignmentResponse(
        val assignmentId: String,
        val role: RoleSummary,
        val organizationId: String?,
        val projectId: String?,
        val projectName: String?,
        val scopeType: String,
        val scopeRefs: List<String>,
        val accessLevel: String,
        val validUntil: String?,
        val status: String,
        val usable: Boolean
    )

    data class MyContextResponse(val defaultAssignmentId: String?, val assignments: List<MyAssignmentResponse>)

    @GetMapping("/context")
    @Authenticated
    fun context(authentication: Authentication): ResponseEntity<MyContextResponse> {
        val context = myAccess.context(UUID.fromString(authentication.name))
        return ResponseEntity.ok(
            MyContextResponse(
                defaultAssignmentId = context.defaultAssignmentId?.toString(),
                assignments = context.assignments.map {
                    MyAssignmentResponse(
                        assignmentId = it.assignment.id.toString(),
                        role = it.role.toSummary(),
                        organizationId = it.assignment.organizationId?.toString(),
                        projectId = it.assignment.projectId?.toString(),
                        projectName = it.projectName,
                        scopeType = it.assignment.scopeType.name,
                        scopeRefs = it.assignment.scopeRefs.sorted(),
                        accessLevel = it.assignment.accessLevel.name,
                        validUntil = it.assignment.validUntil?.toString(),
                        status = it.assignment.status.name,
                        usable = it.usable
                    )
                }
            )
        )
    }

    /**
     * Whether the caller's account is approved and paid up, and if not, why. Available even while the
     * account is blocked, so a client can show "awaiting approval" or "payment due" instead of a bare error.
     */
    @GetMapping("/account")
    @Authenticated
    fun account(authentication: Authentication): AccountResponse {
        val summary = standing.summary(users.getById(UUID.fromString(authentication.name)))
        return AccountResponse(
            approvalStatus = summary.userApproval.name,
            company = summary.organization?.name,
            companyApprovalStatus = summary.organization?.approvalStatus?.name,
            plan = summary.plan?.name,
            monthlyPrice = summary.plan?.monthlyPrice?.toDto(),
            subscriptionStanding = summary.standing?.name,
            paidUntil = summary.subscription?.paidUntil?.toString(),
            amountDue = summary.amountDue?.toDto(),
            canUsePlatform = summary.canUsePlatform,
            blockedReason = summary.blockedReason
        )
    }

    /** Permissions and scope of the assignment named in `X-VC-Assignment`, or of the default one. */
    @GetMapping("/access")
    @Authenticated
    fun access(
        authentication: Authentication,
        @RequestHeader(AccessControlInterceptor.ASSIGNMENT_HEADER, required = false) assignment: String?
    ): ResponseEntity<EffectiveAccessResponse> {
        val requested = assignment?.trim()?.takeIf { it.isNotEmpty() }?.let {
            runCatching { UUID.fromString(it) }.getOrElse { throw AssignmentInvalidException() }
        }
        val access = myAccess.access(UUID.fromString(authentication.name), requested)
        return ResponseEntity.ok(access.context.toResponse(access.role, access.assignment))
    }
}
