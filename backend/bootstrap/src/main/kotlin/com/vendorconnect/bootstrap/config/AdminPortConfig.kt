package com.vendorconnect.bootstrap.config

import com.vendorconnect.application.config.AppProperties
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.catalina.connector.Connector
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.Ordered
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Puts the admin console on its own port when `app.admin.port` differs from `server.port`.
 *
 * Two things make the separation real: a second listener, and a filter that keeps each listener to
 * its own paths. With that in place the admin port can be firewalled or bound to an internal
 * interface (`app.admin.address`) without touching the public API.
 */
@Configuration
class AdminPortConfig(
    properties: AppProperties,
    @Value("\${server.port:8080}") private val serverPort: Int
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val admin = properties.admin
    private val separate = admin.port > 0 && admin.port != serverPort

    @Bean
    fun adminConnectorCustomizer() = WebServerFactoryCustomizer<TomcatServletWebServerFactory> { factory ->
        if (separate) {
            factory.addAdditionalTomcatConnectors(
                Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL).apply {
                    port = admin.port
                    if (admin.address.isNotBlank()) setProperty("address", admin.address)
                }
            )
            log.info("Admin console on port {}{}; API on port {}", admin.port,
                if (admin.address.isNotBlank()) " (bound to ${admin.address})" else "", serverPort)
        } else {
            log.info("Admin console served on the main port {} under /admin", serverPort)
        }
    }

    @Bean
    fun adminPortFilter(): FilterRegistrationBean<AdminPortFilter> =
        FilterRegistrationBean(AdminPortFilter(if (separate) admin.port else null)).apply {
            // Ahead of Spring Security, so the wrong port does not even reveal a login redirect.
            order = Ordered.HIGHEST_PRECEDENCE
        }
}

/**
 * @param adminPort the dedicated admin port, or null when the console shares the main port
 *   (in which case nothing is restricted).
 */
class AdminPortFilter(private val adminPort: Int?) : OncePerRequestFilter() {

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        if (adminPort == null) return chain.doFilter(request, response)

        val path = request.requestURI.removePrefix(request.contextPath)
        val isAdminPath = path == ADMIN_ROOT || path.startsWith("$ADMIN_ROOT/")
        // localPort is the listener the connection arrived on; it cannot be chosen by a request header.
        val onAdminPort = request.localPort == adminPort

        when {
            onAdminPort && isAdminPath -> chain.doFilter(request, response)
            onAdminPort && path == "/" -> response.sendRedirect("${request.contextPath}$ADMIN_ROOT")
            onAdminPort == isAdminPath -> chain.doFilter(request, response)
            else -> response.sendError(HttpServletResponse.SC_NOT_FOUND)
        }
    }

    private companion object {
        const val ADMIN_ROOT = "/admin"
    }
}
