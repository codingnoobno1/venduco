package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.user.UserAdminUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.security.RequirePermission
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

/** User directory and account status. Every operation here exposes or changes other people's accounts. */
@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userUseCase: UserUseCase,
    private val userAdminUseCase: UserAdminUseCase
) {

    data class UserResponse(
        val id: String,
        val email: String,
        val fullName: String,
        val role: String,
        val isActive: Boolean
    )

    @GetMapping
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun listAll(): ResponseEntity<List<UserResponse>> {
        return ResponseEntity.ok(
            userUseCase.listAll().map { it.toResponse() }
        )
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun getById(@PathVariable id: UUID): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userUseCase.getById(id).toResponse())
    }

    @PostMapping("/{id}/deactivate")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun deactivate(@PathVariable id: UUID, ctx: AccessContext): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(setActive(ctx, id, false))
    }

    @PostMapping("/{id}/activate")
    @RequirePermission(Permissions.ADMIN_USER_MANAGE)
    fun activate(@PathVariable id: UUID, ctx: AccessContext): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(setActive(ctx, id, true))
    }

    private fun setActive(ctx: AccessContext, id: UUID, active: Boolean): UserResponse =
        userAdminUseCase.updateUser(ctx, UserAdminUseCase.UpdateUserCommand(userId = id, active = active)).toResponse()

    private fun com.vendorconnect.domain.user.User.toResponse() = UserResponse(
        id = id.toString(),
        email = email,
        fullName = fullName,
        role = role.name,
        isActive = isActive
    )
}
