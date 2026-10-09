package com.vendorconnect.domain.event

import java.time.Instant
import java.util.UUID

/**
 * Base class for all domain events.
 */
abstract class DomainEvent(
    val eventId: UUID = UUID.randomUUID(),
    val occurredAt: Instant = Instant.now()
)

class UserRegisteredEvent(val userId: UUID, val role: String) : DomainEvent()
class TenderCreatedEvent(val tenderId: UUID, val title: String) : DomainEvent()
class TenderPublishedEvent(val tenderId: UUID) : DomainEvent()
class TenderAwardedEvent(val tenderId: UUID, val awardedTo: UUID) : DomainEvent()
class ProjectCreatedEvent(val projectId: UUID, val corridorName: String) : DomainEvent()
class ResourceAllocatedEvent(val projectId: UUID, val resourceType: String) : DomainEvent()
class ProgressUpdatedEvent(val sectionId: UUID, val percentage: Double) : DomainEvent()
