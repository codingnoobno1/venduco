package com.vendorconnect.security

import org.springframework.core.annotation.AnnotatedElementUtils
import org.springframework.web.method.HandlerMethod

/**
 * Every controller method declares exactly one of these three. A method with none is refused at
 * request time and, before that, stops the application from starting (see [EndpointAccessValidator]),
 * so a new endpoint can never be reachable by accident.
 */

/** The caller's active role assignment must hold this permission (a key from `Permissions`). */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class RequirePermission(val value: String)

/** Any signed-in user, whatever their role. For endpoints about the caller themselves. */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class Authenticated

/** No sign-in needed. The path must also be permitted in the security filter chain that serves it. */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class PublicEndpoint

sealed interface EndpointAccess {
    data object Public : EndpointAccess
    data object SignedIn : EndpointAccess
    data class Permission(val key: String) : EndpointAccess

    companion object {
        /** Null when the method declares none of the annotations, or more than one. */
        fun of(handler: HandlerMethod): EndpointAccess? {
            val method = handler.method
            val declared = listOfNotNull(
                AnnotatedElementUtils.findMergedAnnotation(method, RequirePermission::class.java)?.let { Permission(it.value) },
                AnnotatedElementUtils.findMergedAnnotation(method, Authenticated::class.java)?.let { SignedIn },
                AnnotatedElementUtils.findMergedAnnotation(method, PublicEndpoint::class.java)?.let { Public }
            )
            return declared.singleOrNull()
        }

        /** Framework handlers (actuator, the error page) are governed by the filter chain alone. */
        fun isApplicationHandler(handler: HandlerMethod): Boolean = handler.beanType.name.startsWith(APPLICATION_PACKAGE)

        private const val APPLICATION_PACKAGE = "com.vendorconnect."
    }
}
