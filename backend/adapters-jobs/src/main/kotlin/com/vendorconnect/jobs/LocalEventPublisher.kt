package com.vendorconnect.jobs

import com.vendorconnect.application.port.outbound.EventPublisherPort
import com.vendorconnect.domain.event.DomainEvent
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component

/**
 * Phase 1: In-process event publisher using Spring's ApplicationEventPublisher.
 * Events are handled in the same JVM. Zero external dependencies.
 * Replace with KafkaEventPublisher when distributed events are needed.
 */
@Component
class LocalEventPublisher(
    private val applicationEventPublisher: ApplicationEventPublisher
) : EventPublisherPort {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun publish(event: DomainEvent) {
        log.debug("Publishing domain event: {} [{}]", event::class.simpleName, event.eventId)
        applicationEventPublisher.publishEvent(event)
    }
}
