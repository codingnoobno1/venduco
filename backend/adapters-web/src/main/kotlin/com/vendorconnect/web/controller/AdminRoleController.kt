package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.access.RoleAdminUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.access.Portal
import com.vendorconnect.domain.access.ScopeLevel
import com.vendorconnect.security.RequirePermission
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/admin")
class AdminRoleController(private val roles: RoleAdminUseCase) {

    data class PermissionResponse(
        val key: String,
        val resource: String,
        val action: String,
        val kind: String,
        val description: String,
        val sensitive: Boolean
    )

    data class CreateRoleRequest(
        @field:NotBlank val key: String,
        @field:NotBlank @field:Size(max = 80) val name: String,
        @field:Size(max = 300) val description: String? = null,
        @field:NotNull val portal: Portal?,
        @field:NotNull val scopeLevel: ScopeLevel?,
        @field:NotEmpty val permissions: Set<String> = emptySet(),
        @field:Size(max = 80) val defaultDashboardKey: String? = null
    )

    data class UpdateRoleRequest(
        @field:NotBlank @field:Size(max = 80) val name: String,
        @field:Size(max = 300) val description: String? = null,
        @field:NotEmpty val permissions: Set<String> = emptySet(),
        @field:Size(max = 80) val defaultDashboardKey: String? = null,
        val active: Boolean = true
    )

    data class CloneRoleRequest(
        @field:NotBlank val key: String,
        @field:NotBlank @field:Size(max = 80) val name: String
    )

    /** The catalogue roles are built from. Defined in code, so it is read-only. */
    @GetMapping("/permissions")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun permissions(): List<PermissionResponse> =
        Permissions.all.map { PermissionResponse(it.key, it.resource, it.action, it.kind.name, it.description, it.sensitive) }

    @GetMapping("/roles")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun list(): List<RoleResponse> = roles.list().map { it.toResponse() }

    @GetMapping("/roles/{id}")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun get(@PathVariable id: UUID): RoleResponse = roles.get(id).toResponse()

    @PostMapping("/roles")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun create(@Valid @RequestBody request: CreateRoleRequest, ctx: AccessContext): ResponseEntity<RoleResponse> {
        val role = roles.create(
            ctx,
            RoleAdminUseCase.CreateRoleCommand(
                key = request.key,
                name = request.name,
                description = request.description,
                portal = request.portal!!,
                scopeLevel = request.scopeLevel!!,
                permissions = request.permissions,
                defaultDashboardKey = request.defaultDashboardKey
            )
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(role.toResponse())
    }

    @PutMapping("/roles/{id}")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun update(@PathVariable id: UUID, @Valid @RequestBody request: UpdateRoleRequest, ctx: AccessContext): RoleResponse =
        roles.update(
            ctx, id,
            RoleAdminUseCase.UpdateRoleCommand(
                request.name, request.description, request.permissions, request.defaultDashboardKey, request.active
            )
        ).toResponse()

    @PostMapping("/roles/{id}/clone")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun clone(
        @PathVariable id: UUID,
        @Valid @RequestBody request: CloneRoleRequest,
        ctx: AccessContext
    ): ResponseEntity<RoleResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(roles.clone(ctx, id, request.key, request.name).toResponse())

    @DeleteMapping("/roles/{id}")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun delete(@PathVariable id: UUID, ctx: AccessContext): ResponseEntity<Void> {
        roles.delete(ctx, id)
        return ResponseEntity.noContent().build()
    }
}
