package com.vendorconnect.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

/**
 * JWT Authentication Filter.
 * Extracts JWT from HttpOnly cookie (not Authorization header) for maximum security.
 * Falls back to Bearer token in header for API clients (mobile, Postman).
 *
 * It only establishes identity. What the caller may do is decided per endpoint by
 * [AccessControlInterceptor] from their role assignment, never from the token. The single
 * `ROLE_<legacy role>` authority exists for the actuator (health details are shown to ROLE_ADMIN).
 *
 * Deliberately not a @Component: Spring Boot would otherwise also register it as a
 * plain servlet filter outside the security chain. It is added in [SecurityConfig].
 */
class JwtAuthenticationFilter(
    private val jwtTokenService: JwtTokenService,
    private val cookieName: String
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        if (SecurityContextHolder.getContext().authentication == null) {
            // A stale cookie must not shadow a valid Bearer header, so try each candidate in turn.
            val claims = listOfNotNull(extractTokenFromCookie(request), extractTokenFromHeader(request))
                .firstNotNullOfOrNull(jwtTokenService::parseAccessToken)

            if (claims != null) {
                SecurityContextHolder.getContext().authentication =
                    UsernamePasswordAuthenticationToken(
                        claims.userId.toString(), null, listOf(SimpleGrantedAuthority("ROLE_${claims.role}"))
                    )
            }
        }

        filterChain.doFilter(request, response)
    }

    private fun extractTokenFromCookie(request: HttpServletRequest): String? {
        return request.cookies?.find { it.name == cookieName }?.value?.takeIf { it.isNotBlank() }
    }

    private fun extractTokenFromHeader(request: HttpServletRequest): String? {
        val header = request.getHeader("Authorization")
        return if (header?.startsWith("Bearer ") == true) header.substring(7).takeIf { it.isNotBlank() } else null
    }
}
