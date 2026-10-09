package com.vendorconnect.jobs.ai

import com.vendorconnect.application.port.outbound.AiServicePort
import org.springframework.boot.actuate.health.Health
import org.springframework.boot.actuate.health.HealthIndicator
import org.springframework.stereotype.Component

/**
 * Reports the AI service under /api/v1/health (details visible to admins only).
 * The mock adapter is a supported mode, so it reports UP rather than dragging overall health down.
 */
@Component("aiService")
class AiServiceHealthIndicator(
    private val aiService: AiServicePort
) : HealthIndicator {

    override fun health(): Health =
        if (aiService.isAvailable()) Health.up().withDetail("mode", "remote").build()
        else Health.up().withDetail("mode", "mock").build()
}
