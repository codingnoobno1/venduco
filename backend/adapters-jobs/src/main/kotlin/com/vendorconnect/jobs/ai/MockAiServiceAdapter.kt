package com.vendorconnect.jobs.ai

import com.vendorconnect.application.port.outbound.AiServicePort
import com.vendorconnect.domain.tender.TenderAiAnalysis
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

/**
 * Phase 1: Mock AI adapter.
 * Returns safe default values. The app works perfectly without the Python service.
 * Activated when app.ai.enabled=false (default).
 */
@Component
@ConditionalOnProperty(name = ["app.ai.enabled"], havingValue = "false", matchIfMissing = true)
class MockAiServiceAdapter : AiServicePort {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun scanTender(documentContent: ByteArray, fileName: String): TenderAiAnalysis {
        log.info("AI Service not configured. Returning mock analysis for: {}", fileName)
        return TenderAiAnalysis(
            riskScore = 0.0,
            extractedEntities = emptyList(),
            recommendations = listOf("AI analysis not configured. Enable the Python AI microservice for real results.")
        )
    }

    override fun isAvailable(): Boolean = false
}
