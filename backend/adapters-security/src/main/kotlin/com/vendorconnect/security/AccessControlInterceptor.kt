package com.vendorconnect.security

import com.vendorconnect.application.usecase.access.AccessContextResolver
import com.vendorconnect.domain.shared.AssignmentInvalidException
import com.vendorconnect.domain.shared.InsufficientPermissionException
import com.vendorconnect.domain.access.AccessContext
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.MethodParameter
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.authentication.InsufficientAuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.context.request.RequestAttributes
import org.springframework.web.method.HandlerMethod
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import org.springframework.web.servlet.HandlerInterceptor
import java.util.UUID

/**
 * Authorises every application endpoint from its [EndpointAccess] declaration and, for
 * permission-protected ones, attaches the caller's [AccessContext] to the request.
 *
 * The JWT filter has already established *who* is calling; this decides *what they may do*,
 * from the role assignment named in the `X-VC-Assignment` header (or their default one).
 */
@Component
class AccessControlInterceptor(private val resolver: AccessContextResolver) : HandlerInterceptor {

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        if (handler !is HandlerMethod || !EndpointAccess.isApplicationHandler(handler)) return true

        when (val access = EndpointAccess.of(handler)) {
            // Unreachable once the startup validator has passed; denying is the safe answer if it ever is reached.
            null -> throw InsufficientPermissionException("${request.method} ${request.requestURI}")
            EndpointAccess.Public -> Unit
            EndpointAccess.SignedIn -> currentUserId()
            is EndpointAccess.Permission -> {
                val context = resolver.resolve(currentUserId(), requestedAssignment(request))
                context.require(access.key)
                request.setAttribute(CONTEXT_ATTRIBUTE, context)
            }
        }
        return true
    }

    private fun currentUserId(): UUID {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || !authentication.isAuthenticated || authentication is AnonymousAuthenticationToken) {
            throw InsufficientAuthenticationException("Authentication is required")
        }
        return UUID.fromString(authentication.name)
    }

    private fun requestedAssignment(request: HttpServletRequest): UUID? {
        val header = request.getHeader(ASSIGNMENT_HEADER)?.trim()?.takeIf { it.isNotEmpty() }
            // The admin console has no client code to send the header: its sign-in fixes the assignment.
            ?: return (SecurityContextHolder.getContext().authentication?.principal as? AdminPrincipal)?.assignmentId
        return runCatching { UUID.fromString(header) }.getOrElse { throw AssignmentInvalidException() }
    }

    companion object {
        const val ASSIGNMENT_HEADER = "X-VC-Assignment"
        const val CONTEXT_ATTRIBUTE = "vc.accessContext"
    }
}

/** Lets a `@RequirePermission` controller method take the caller's [AccessContext] as a parameter. */
@Component
class AccessContextArgumentResolver : HandlerMethodArgumentResolver {

    override fun supportsParameter(parameter: MethodParameter): Boolean = parameter.parameterType == AccessContext::class.java

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): Any = webRequest.getAttribute(AccessControlInterceptor.CONTEXT_ATTRIBUTE, RequestAttributes.SCOPE_REQUEST)
        ?: error("${parameter.method} takes an AccessContext but is not annotated with @RequirePermission")
}
