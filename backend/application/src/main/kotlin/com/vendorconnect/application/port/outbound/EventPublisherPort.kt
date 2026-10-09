package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.event.DomainEvent

/**
 * Port for publishing domain events.
 * Phase 1: LocalEventPublisher (Spring ApplicationEventPublisher)
 * Phase 4: KafkaEventPublisher
 */
interface EventPublisherPort {
    fun publish(event: DomainEvent)
}
