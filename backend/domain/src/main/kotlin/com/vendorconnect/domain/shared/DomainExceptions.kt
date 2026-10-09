package com.vendorconnect.domain.shared

import com.vendorconnect.domain.shared.ErrorCode

/**
 * Base domain exception — all business rule violations extend this.
 */
open class DomainException(
    message: String,
    val errorCode: ErrorCode = ErrorCode.VALIDATION_FAILED,
    cause: Throwable? = null
) : RuntimeException(message, cause)

class EntityNotFoundException(entity: String, id: Any) :
    DomainException("$entity with id '$id' not found", ErrorCode.ENTITY_NOT_FOUND)

class InsufficientPermissionException(action: String) :
    DomainException("Insufficient permission to perform: $action", ErrorCode.AUTH_INSUFFICIENT_PERMISSION)

class InvalidStateTransitionException(entity: String, from: String, to: String) :
    DomainException("Invalid state transition for $entity: $from → $to", ErrorCode.ENTITY_INVALID_STATE)

class DuplicateEntityException(entity: String, field: String, value: String) :
    DomainException("$entity with $field '$value' already exists", ErrorCode.ENTITY_DUPLICATE)

/** Same message for unknown email and wrong password, so login cannot be used to discover accounts. */
class InvalidCredentialsException :
    DomainException(ErrorCode.AUTH_INVALID_CREDENTIALS.defaultMessage, ErrorCode.AUTH_INVALID_CREDENTIALS)

class InvalidTokenException :
    DomainException(ErrorCode.AUTH_TOKEN_INVALID.defaultMessage, ErrorCode.AUTH_TOKEN_INVALID)

class AccountDisabledException :
    DomainException(ErrorCode.AUTH_ACCOUNT_DISABLED.defaultMessage, ErrorCode.AUTH_ACCOUNT_DISABLED)

/** The request is well-formed but cannot be applied to the entity as it currently stands (→ HTTP 409). */
class ConflictException(message: String) : DomainException(message, ErrorCode.ENTITY_INVALID_STATE)

/** The user, or the company they belong to, has not been approved (or has been rejected or suspended). */
class AccountNotApprovedException(detail: String) : DomainException(detail, ErrorCode.ACCOUNT_NOT_APPROVED)

/** The subscription is unpaid, overdue past its grace period, suspended or cancelled (HTTP 402). */
class PaymentRequiredException(detail: String) : DomainException(detail, ErrorCode.ACCOUNT_PAYMENT_REQUIRED)

/** Several fields of one form were refused; the message for each is keyed by field. */
class FieldErrorsException(val fieldErrors: Map<String, String>) :
    DomainException("Some answers need attention.", ErrorCode.VALIDATION_FAILED)

/** The caller has no assignment they can act under: none exists, it expired, or the one named is not theirs. */
class AssignmentInvalidException(detail: String? = null) :
    DomainException(detail ?: ErrorCode.ACCESS_ASSIGNMENT_INVALID.defaultMessage, ErrorCode.ACCESS_ASSIGNMENT_INVALID)

/**
 * Domain counterpart of [require]: throws [DomainException] (→ HTTP 400) instead of
 * IllegalArgumentException, which is reserved for programming errors (→ HTTP 500).
 */
inline fun requireDomain(condition: Boolean, lazyMessage: () -> String) {
    if (!condition) throw DomainException(lazyMessage())
}
