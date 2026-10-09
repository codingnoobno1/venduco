package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.tender.TenderAiAnalysis

/**
 * Port for the AI microservice.
 * Phase 1: MockAiServiceAdapter (returns safe defaults)
 * Phase 3: HttpAiServiceAdapter (calls Python FastAPI)
 */
interface AiServicePort {
    fun scanTender(documentContent: ByteArray, fileName: String): TenderAiAnalysis
    fun isAvailable(): Boolean
}
