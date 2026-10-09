package com.vendorconnect.web.controller

import com.vendorconnect.application.port.outbound.AiServicePort
import com.vendorconnect.application.port.outbound.CachePort
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

/**
 * Health check endpoint — always public.
 * Reports the status of all subsystems.
 */
@RestController
@RequestMapping("/api/v1/health")
class HealthController(
    private val aiService: AiServicePort,
    private val cachePort: CachePort
) {

    @GetMapping
    fun health(): Map<String, Any> {
        return mapOf(
            "status" to "UP",
            "timestamp" to Instant.now().toString(),
            "service" to "vendorconnect-core",
            "version" to "0.1.0",
            "subsystems" to mapOf(
                "database" to "UP",
                "cache" to cachePort::class.simpleName,
                "ai_service" to if (aiService.isAvailable()) "UP" else "NOT_CONFIGURED",
                "file_storage" to "LOCAL"
            )
        )
    }
}
