package com.vendorconnect.web.controller

import com.vendorconnect.application.port.outbound.AuditLogPort
import com.vendorconnect.application.usecase.access.AssignmentAdminUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.AccessLevel
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.access.ScopeType
import com.vendorconnect.security.RequirePermission
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/v1/admin")
class AdminAssignmentController(
    private val assignments: AssignmentAdminUseCase,
    private val auditLog: AuditLogPort
) {

    data class CreateAssignmentRequest(
        @field:NotNull val userId: UUID?,
        @field:NotNull val roleId: UUID?,
        val organizationId: UUID? = null,
        val projectId: UUID? = null,
        val scopeType: ScopeType = ScopeType.ALL,
        @field:Size(max = 200) val scopeRefs: Set<String> = emptySet(),
        val accessLevel: AccessLevel = AccessLevel.FULL,
        @field:Valid val approvalLimit: MoneyDto? = null,
        val reviewerUserId: UUID? = null,
        val validFrom: LocalDate? = null,
        val validUntil: LocalDate? = null
    )

    /** Omitted fields are left unchanged; the `clear` flags remove an optional value. */
    data class UpdateAssignmentRequest(
        val accessLevel: AccessLevel? = null,
        @field:Valid val approvalLimit: MoneyDto? = null,
        val clearApprovalLimit: Boolean = false,
        val reviewerUserId: UUID? = null,
        val clearReviewer: Boolean = false,
        val validUntil: LocalDate? = null,
        val clearValidUntil: Boolean = false,
        val suspended: Boolean? = null
    )

    data class AuditEntryResponse(
        val id: String,
        val occurredAt: String,
        val actorUserId: String?,
        val assignmentId: String?,
        val action: String,
        val entityType: String,
        val entityId: String,
        val summary: String
    )

    @GetMapping("/assignments")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun list(
        @RequestParam(required = false) userId: UUID?,
        @RequestParam(required = false) roleId: UUID?,
        @RequestParam(required = false) projectId: UUID?
    ): List<AssignmentResponse> =
        assignments.list(userId, roleId, projectId).map { it.assignment.toResponse(it.role, it.usable) }

    @GetMapping("/assignments/{id}")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun get(@PathVariable id: UUID): AssignmentResponse =
        assignments.get(id).let { it.assignment.toResponse(it.role, it.usable) }

    /** Exactly what the server allows under this assignment, for diagnosing access questions. */
    @GetMapping("/assignments/{id}/effective-access")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun effectiveAccess(@PathVariable id: UUID): EffectiveAccessResponse {
        val (view, context) = assignments.effectiveAccess(id)
        return context.toResponse(view.role, view.assignment)
    }

    @PostMapping("/assignments")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun create(@Valid @RequestBody request: CreateAssignmentRequest, ctx: AccessContext): ResponseEntity<AssignmentResponse> {
        val view = assignments.create(
            ctx,
            AssignmentAdminUseCase.CreateAssignmentCommand(
                userId = request.userId!!,
                roleId = request.roleId!!,
                organizationId = request.organizationId,
                projectId = request.projectId,
                scopeType = request.scopeType,
                scopeRefs = request.scopeRefs.map { it.trim() }.filterTo(mutableSetOf()) { it.isNotEmpty() },
                accessLevel = request.accessLevel,
                approvalLimit = request.approvalLimit?.toDomain(),
                reviewerUserId = request.reviewerUserId,
                validFrom = request.validFrom ?: LocalDate.now(),
                validUntil = request.validUntil
            )
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(view.assignment.toResponse(view.role, view.usable))
    }

    @PatchMapping("/assignments/{id}")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun update(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateAssignmentRequest,
        ctx: AccessContext
    ): AssignmentResponse =
        assignments.update(
            ctx, id,
            AssignmentAdminUseCase.UpdateAssignmentCommand(
                accessLevel = request.accessLevel,
                approvalLimit = request.approvalLimit?.toDomain(),
                clearApprovalLimit = request.clearApprovalLimit,
                reviewerUserId = request.reviewerUserId,
                clearReviewer = request.clearReviewer,
                validUntil = request.validUntil,
                clearValidUntil = request.clearValidUntil,
                suspended = request.suspended
            )
        ).let { it.assignment.toResponse(it.role, it.usable) }

    /** Revokes the assignment. The record is kept. */
    @DeleteMapping("/assignments/{id}")
    @RequirePermission(Permissions.ADMIN_ASSIGNMENT_MANAGE)
    fun revoke(@PathVariable id: UUID, ctx: AccessContext): ResponseEntity<Void> {
        assignments.revoke(ctx, id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/audit")
    @RequirePermission(Permissions.ADMIN_AUDIT_READ)
    fun audit(
        @RequestParam(required = false) entityType: String?,
        @RequestParam(required = false) entityId: String?,
        @RequestParam(required = false) actorUserId: UUID?,
        @RequestParam(defaultValue = "50") limit: Int
    ): List<AuditEntryResponse> =
        auditLog.findRecent(entityType, entityId, actorUserId, limit.coerceIn(1, 200)).map {
            AuditEntryResponse(
                it.id.toString(), it.occurredAt.toString(), it.actorUserId?.toString(), it.assignmentId?.toString(),
                it.action, it.entityType, it.entityId, it.summary
            )
        }
}
