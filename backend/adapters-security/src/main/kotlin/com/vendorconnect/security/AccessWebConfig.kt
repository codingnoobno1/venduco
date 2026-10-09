package com.vendorconnect.security

import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import org.springframework.beans.factory.SmartInitializingSingleton
import org.springframework.context.ApplicationContext
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping

@Configuration
class AccessWebConfig(
    private val interceptor: AccessControlInterceptor,
    private val contextResolver: AccessContextArgumentResolver
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(interceptor)
    }

    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(contextResolver)
    }
}

/**
 * Fails startup if any application endpoint has no access declaration, names a permission that is
 * not in the catalogue, or asks for an [AccessContext] it would never be given.
 * A misspelt permission must be a build failure, not an endpoint nobody can reach (or everybody can).
 */
@Component
class EndpointAccessValidator(private val applicationContext: ApplicationContext) : SmartInitializingSingleton {

    override fun afterSingletonsInstantiated() {
        val mapping = applicationContext.getBean("requestMappingHandlerMapping", RequestMappingHandlerMapping::class.java)
        val problems = mapping.handlerMethods.values
            .filter(EndpointAccess::isApplicationHandler)
            .mapNotNull { handler ->
                val access = EndpointAccess.of(handler)
                val takesContext = handler.methodParameters.any { it.parameterType == AccessContext::class.java }
                when {
                    access == null -> "$handler: declare exactly one of @RequirePermission, @Authenticated, @PublicEndpoint"
                    access is EndpointAccess.Permission && !Permissions.isKnown(access.key) ->
                        "$handler: unknown permission '${access.key}'"
                    takesContext && access !is EndpointAccess.Permission ->
                        "$handler: an AccessContext parameter needs @RequirePermission"
                    else -> null
                }
            }
        check(problems.isEmpty()) { "Endpoint access declarations are invalid:\n" + problems.joinToString("\n") }
    }
}
