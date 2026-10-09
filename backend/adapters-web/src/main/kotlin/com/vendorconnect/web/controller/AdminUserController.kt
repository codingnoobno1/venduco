package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.user.UserAdminUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.user.UserRole
import com.vendorconnect.security.RequirePermission
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

/**
 * Changes a user's legacy role and active flag. The legacy role is mirrored into a role assignment;
 * further, scoped assignments are managed through [AdminAssignmentController].
 */
@RestController
@RequestMapping("/api/v1/admin/users")
class AdminUserController(
    private val userAdminUseCase: UserAdminUseCase
) {

    data class UpdateUserRequest(val role: UserRole? = null, val active: Boolean? = null)

    data class UserResponse(
        val id: String,
        val email: String,
        val fullName: String,
        val role: String,
        val active: Boolean
    )

    @PatchMapping("/{id}")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun updateUser(
        @PathVariable id: UUID,
        @RequestBody request: UpdateUserRequest,
        ctx: AccessContext
    ): ResponseEntity<UserResponse> {
        val user = userAdminUseCase.updateUser(
            ctx,
            UserAdminUseCase.UpdateUserCommand(userId = id, role = request.role, active = request.active)
        )
        return ResponseEntity.ok(UserResponse(user.id.toString(), user.email, user.fullName, user.role.name, user.isActive))
    }
}
