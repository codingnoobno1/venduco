package com.vendorconnect.application.usecase.tender

import com.vendorconnect.application.port.outbound.AiServicePort
import com.vendorconnect.application.port.outbound.CachePort
import com.vendorconnect.application.port.outbound.EventPublisherPort
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.domain.event.TenderPublishedEvent
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.domain.tender.Tender
import com.vendorconnect.domain.tender.TenderStatus
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Service
class TenderUseCase(
    private val tenderRepository: TenderRepositoryPort,
    private val aiService: AiServicePort,
    private val cachePort: CachePort,
    private val eventPublisher: EventPublisherPort
) {

    data class CreateTenderCommand(
        val title: String,
        val description: String,
        val projectId: UUID,
        val packageId: UUID? = null,
        val estimatedValue: Money,
        val closingDate: LocalDate
    )

    data class TenderListQuery(
        val status: TenderStatus? = null,
        val projectId: UUID? = null,
        val page: Int = 0,
        val size: Int = 20
    )

    fun create(command: CreateTenderCommand): Tender {
        val tender = Tender(
            title = command.title,
            description = command.description,
            referenceNumber = generateReferenceNumber(),
            projectId = command.projectId,
            packageId = command.packageId,
            estimatedValue = command.estimatedValue,
            closingDate = command.closingDate
        )
        return tenderRepository.save(tender)
    }

    fun getById(id: UUID): Tender {
        val cacheKey = "tender:$id"
        cachePort.get(cacheKey, Tender::class.java)?.let { return it }

        val tender = tenderRepository.findById(id)
            ?: throw EntityNotFoundException("Tender", id)

        cachePort.set(cacheKey, tender, ttlSeconds = 300)
        return tender
    }

    fun publish(id: UUID): Tender {
        val tender = getById(id)
        
        // This will throw if state transition is invalid or items are empty
        val published = tender.publish()
        val saved = tenderRepository.save(published)

        cachePort.delete("tender:$id")
        eventPublisher.publish(TenderPublishedEvent(saved.id))

        return saved
    }

    fun analyzeWithAi(id: UUID): Tender {
        val tender = getById(id)

        if (!aiService.isAvailable()) {
            return tender // Graceful fallback
        }

        // Mock document content for AI scan
        val content = "${tender.title}\n${tender.description}".toByteArray()
        val aiAnalysis = aiService.scanTender(content, "${tender.referenceNumber}.txt")

        val analyzed = tender.attachAiAnalysis(aiAnalysis)
        val saved = tenderRepository.save(analyzed)
        cachePort.delete("tender:$id")
        return saved
    }

    fun list(query: TenderListQuery): List<Tender> {
        // Simple list for phase 1
        return tenderRepository.findAll()
    }

    private fun generateReferenceNumber(): String {
        val year = LocalDate.now().year
        val seq = (1000..9999).random()
        return "VC-TND-$year-$seq"
    }
}
