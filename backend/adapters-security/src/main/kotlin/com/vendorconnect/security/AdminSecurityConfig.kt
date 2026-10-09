package com.vendorconnect.security

import com.vendorconnect.application.usecase.access.MyAccessUseCase
import com.vendorconnect.application.usecase.auth.AuthUseCase
import com.vendorconnect.domain.shared.DomainException
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.Authentication
import org.springframework.security.web.SecurityFilterChain
import java.io.Serializable
import java.security.Principal
import java.util.UUID

/**
 * Who is signed in to the admin console, and the role assignment they administer under.
 * [getName] is the user id, which is what the rest of the access layer expects of an authentication.
 */
data class AdminPrincipal(
    val userId: UUID,
    val email: String,
    val fullName: String,
    val assignmentId: UUID
) : Principal, Serializable {
    override fun getName(): String = userId.toString()
}

/**
 * Security for the server-rendered admin console under `/admin`.
 *
 * Unlike the API it keeps a server session and signs in with a form, so it needs no client-side
 * code to carry tokens; CSRF protection is on because every change is a form post.
 * It is ordered ahead of the API chain in [SecurityConfig] and only claims `/admin` paths.
 */
@Configuration
class AdminSecurityConfig(
    private val authUseCase: AuthUseCase,
    private val myAccess: MyAccessUseCase
) {

    @Bean
    @Order(1)
    fun adminSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .securityMatcher("/admin", "/admin/**")
            .authorizeHttpRequests {
                it.requestMatchers("/admin/login", "/admin/assets/**").permitAll()
                    .anyRequest().authenticated()
            }
            .authenticationProvider(adminAuthenticationProvider())
            .formLogin {
                it.loginPage("/admin/login")
                    .loginProcessingUrl("/admin/login")
                    .usernameParameter("email")
                    .defaultSuccessUrl("/admin", true)
                    .failureUrl("/admin/login?error")
            }
            .logout {
                it.logoutUrl("/admin/logout").logoutSuccessUrl("/admin/login?logout")
            }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) }
            .headers {
                // The console ships no scripts; this makes the browser refuse any that get injected.
                it.contentSecurityPolicy { csp ->
                    csp.policyDirectives("default-src 'self'; script-src 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'")
                }
            }
        return http.build()
    }

    /**
     * Signs in with the same accounts as the API, but only users who hold an administrative
     * assignment get a session. Every failure looks the same, so the form cannot be used to find
     * out which accounts exist or which of them are administrators.
     */
    private fun adminAuthenticationProvider() = object : AuthenticationProvider {

        override fun authenticate(authentication: Authentication): Authentication {
            val user = try {
                authUseCase.verifyCredentials(
                    AuthUseCase.LoginCommand(authentication.name, authentication.credentials?.toString().orEmpty())
                )
            } catch (e: DomainException) {
                throw BadCredentialsException(FAILURE)
            }
            val assignmentId = myAccess.adminAssignmentId(user.id) ?: throw BadCredentialsException(FAILURE)

            return UsernamePasswordAuthenticationToken(
                AdminPrincipal(user.id, user.email, user.fullName, assignmentId), null, emptyList()
            )
        }

        override fun supports(authentication: Class<*>): Boolean =
            UsernamePasswordAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

    private companion object {
        const val FAILURE = "Sign-in failed"
    }
}
