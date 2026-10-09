package com.vendorconnect.security

import com.fasterxml.jackson.databind.ObjectMapper
import com.vendorconnect.security.error.ApiError
import com.vendorconnect.application.config.AppProperties
import com.vendorconnect.domain.shared.ErrorCode
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val properties: AppProperties,
    private val jwtTokenService: JwtTokenService,
    private val objectMapper: ObjectMapper
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            // Cookie auth without CSRF tokens relies on SameSite=Lax (the default) blocking
            // cross-site POSTs. Do not set cookie-same-site to None without adding CSRF protection.
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(*PUBLIC_PATHS).permitAll()
                    // Identity only. Permissions are enforced per endpoint by AccessControlInterceptor,
                    // which refuses any controller method that does not declare its access.
                    .anyRequest().authenticated()
            }
            .exceptionHandling {
                it.authenticationEntryPoint { _, response, _ ->
                    writeError(response, HttpStatus.UNAUTHORIZED, ErrorCode.AUTH_REQUIRED)
                }
                it.accessDeniedHandler { _, response, _ ->
                    writeError(response, HttpStatus.FORBIDDEN, ErrorCode.AUTH_INSUFFICIENT_PERMISSION)
                }
            }
            .addFilterBefore(
                JwtAuthenticationFilter(jwtTokenService, properties.jwt.cookieName),
                UsernamePasswordAuthenticationFilter::class.java
            )

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOrigins = properties.cors.allowedOrigins
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true  // Required for cookies
            maxAge = 3600
        }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", config)
        }
    }

    private fun writeError(response: HttpServletResponse, status: HttpStatus, code: ErrorCode) {
        response.status = status.value()
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        objectMapper.writeValue(response.outputStream, ApiError.of(status, code))
    }

    companion object {
        /** Reachable without signing in. Controller methods under these paths are marked @PublicEndpoint. */
        val PUBLIC_PATHS = arrayOf(
            "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh", "/api/v1/auth/logout",
            "/api/v1/health", "/api/v1/health/**",
            "/api/v1/connectivity",   // added for the layered build: the cross-layer check
            "/error"
        )
    }
}
