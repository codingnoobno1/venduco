package com.vendorconnect.web.controller

import com.vendorconnect.application.usecase.auth.AuthUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.shared.InvalidTokenException
import com.vendorconnect.application.config.AppProperties
import com.vendorconnect.security.Authenticated
import com.vendorconnect.security.LegacyUiRouteCatalog
import com.vendorconnect.security.PublicEndpoint
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Duration
import java.util.UUID

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authUseCase: AuthUseCase,
    private val userUseCase: UserUseCase,
    private val uiRoutes: LegacyUiRouteCatalog,
    properties: AppProperties
) {
    private val jwt = properties.jwt

    /** No `role` field: self-registration always creates a VENDOR. Unknown JSON fields are ignored. */
    data class RegisterRequest(
        @field:NotBlank @field:Email @field:Size(max = 254)
        val email: String,
        @field:NotBlank @field:Size(max = 120)
        val fullName: String,
        @field:Size(min = 8, max = 72, message = "must be between 8 and 72 characters")
        val password: String,
        /** Present when a company registers; omit it to register as an individual. */
        @field:Size(max = 160)
        val companyName: String? = null
    )

    data class LoginRequest(
        @field:NotBlank val email: String,
        @field:NotBlank val password: String
    )

    data class AuthResponse(
        val id: String,
        val email: String,
        val fullName: String,
        val role: String,
        val message: String
    )

    data class UserProfileResponse(
        val id: String,
        val email: String,
        val fullName: String,
        val role: String,
        val organizationId: String?,
        val permissions: List<String>,
        val dynamicUiRoutes: List<com.vendorconnect.security.UiRouteMapping>
    )

    @PostMapping("/register")
    @PublicEndpoint
    fun register(@Valid @RequestBody request: RegisterRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        val result = authUseCase.register(
            AuthUseCase.RegisterCommand(
                email = request.email,
                fullName = request.fullName,
                password = request.password,
                companyName = request.companyName
            )
        )
        return authenticated(response, result, "Registration successful")
    }

    @PostMapping("/login")
    @PublicEndpoint
    fun login(@Valid @RequestBody request: LoginRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        val result = authUseCase.login(
            AuthUseCase.LoginCommand(email = request.email, password = request.password)
        )
        return authenticated(response, result, "Login successful")
    }

    /** Exchanges the refresh cookie for a new access + refresh token pair. */
    @PostMapping("/refresh")
    @PublicEndpoint
    fun refresh(request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        val refreshToken = request.cookies?.find { it.name == jwt.refreshCookieName }?.value
            ?: throw InvalidTokenException()
        return authenticated(response, authUseCase.refresh(refreshToken), "Token refreshed")
    }

    @PostMapping("/logout")
    @PublicEndpoint
    fun logout(response: HttpServletResponse): ResponseEntity<Map<String, String>> {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(jwt.cookieName, "", ACCESS_PATH, Duration.ZERO))
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(jwt.refreshCookieName, "", REFRESH_PATH, Duration.ZERO))
        return ResponseEntity.ok(mapOf("message" to "Logged out"))
    }

    /**
     * Identity plus the legacy role, permission names and sidebar the current frontend is built on.
     * The assignment-based view of the same user is served by `/api/v1/me/context` and `/api/v1/me/access`.
     */
    @GetMapping("/me")
    @Authenticated
    fun me(authentication: org.springframework.security.core.Authentication): ResponseEntity<UserProfileResponse> {
        val userId = UUID.fromString(authentication.name)
        val user = userUseCase.getById(userId)
        val permissions = user.role.permissions.map { it.name }
        val routes = uiRoutes.getAccessibleUiRoutes(user.role)

        return ResponseEntity.ok(
            UserProfileResponse(
                id = user.id.toString(),
                email = user.email,
                fullName = user.fullName,
                role = user.role.name,
                organizationId = user.organizationId?.toString(),
                permissions = permissions,
                dynamicUiRoutes = routes
            )
        )
    }

    @GetMapping("/dynamic-routes")
    @Authenticated
    fun getDynamicRoutes(authentication: org.springframework.security.core.Authentication): ResponseEntity<List<com.vendorconnect.security.UiRouteMapping>> {
        val userId = UUID.fromString(authentication.name)
        val user = userUseCase.getById(userId)
        return ResponseEntity.ok(uiRoutes.getAccessibleUiRoutes(user.role))
    }

    private fun authenticated(
        response: HttpServletResponse,
        result: AuthUseCase.AuthResult,
        message: String
    ): ResponseEntity<AuthResponse> {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(jwt.cookieName, result.accessToken, ACCESS_PATH, jwt.accessTokenTtl))
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(jwt.refreshCookieName, result.refreshToken, REFRESH_PATH, jwt.refreshTokenTtl))

        return ResponseEntity.ok(AuthResponse(
            id = result.user.id.toString(),
            email = result.user.email,
            fullName = result.user.fullName,
            role = result.user.role.name,
            message = message
        ))
    }

    private fun cookie(name: String, value: String, path: String, maxAge: Duration): String =
        ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(jwt.cookieSecure)
            .sameSite(jwt.cookieSameSite)
            .path(path)
            .maxAge(maxAge)
            .build()
            .toString()

    private companion object {
        const val ACCESS_PATH = "/"
        const val REFRESH_PATH = "/api/v1/auth"
    }
}
