package com.vendorconnect.web.advice

import com.vendorconnect.security.error.ApiError
import com.vendorconnect.domain.shared.*
import com.vendorconnect.domain.shared.ErrorCode
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.AuthenticationException
import org.springframework.web.ErrorResponse
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.HandlerMethodValidationException

/**
 * Global exception handler — converts domain and framework exceptions into proper HTTP responses.
 * Only genuinely unexpected errors become 500s.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(DomainException::class)
    fun handleDomainException(ex: DomainException): ResponseEntity<ApiError> {
        val status = when (ex) {
            is EntityNotFoundException -> HttpStatus.NOT_FOUND
            is DuplicateEntityException, is InvalidStateTransitionException, is ConflictException -> HttpStatus.CONFLICT
            is InvalidCredentialsException, is InvalidTokenException -> HttpStatus.UNAUTHORIZED
            is InsufficientPermissionException, is AccountDisabledException, is AssignmentInvalidException,
            is AccountNotApprovedException -> HttpStatus.FORBIDDEN
            is PaymentRequiredException -> HttpStatus.PAYMENT_REQUIRED
            else -> HttpStatus.BAD_REQUEST
        }
        return respond(status, ex.errorCode, ex.message, (ex as? FieldErrorsException)?.fieldErrors)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiError> {
        val fieldErrors = ex.bindingResult.fieldErrors.associate { it.field to (it.defaultMessage ?: "is invalid") }
        return respond(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, fieldErrors = fieldErrors)
    }

    @ExceptionHandler(HandlerMethodValidationException::class)
    fun handleMethodValidation(ex: HandlerMethodValidationException): ResponseEntity<ApiError> =
        respond(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED)

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleUnreadable(ex: HttpMessageNotReadableException): ResponseEntity<ApiError> =
        respond(HttpStatus.BAD_REQUEST, ErrorCode.REQUEST_MALFORMED)

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException): ResponseEntity<ApiError> =
        respond(HttpStatus.FORBIDDEN, ErrorCode.AUTH_INSUFFICIENT_PERMISSION)

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthentication(ex: AuthenticationException): ResponseEntity<ApiError> =
        respond(HttpStatus.UNAUTHORIZED, ErrorCode.AUTH_REQUIRED)

    /** e.g. two concurrent registrations with the same email hitting the unique constraint. */
    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrity(ex: DataIntegrityViolationException): ResponseEntity<ApiError> {
        log.warn("Data integrity violation: {}", ex.mostSpecificCause.message)
        return respond(HttpStatus.CONFLICT, ErrorCode.ENTITY_DUPLICATE, "Request conflicts with existing data")
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneral(ex: Exception): ResponseEntity<ApiError> {
        // Spring MVC exceptions (404 no route, 405 wrong method, 415 media type, ...) carry their own status.
        if (ex is ErrorResponse) {
            val status = ex.statusCode
            return respond(status, if (status.is5xxServerError) ErrorCode.SYSTEM_INTERNAL_ERROR else ErrorCode.HTTP_ERROR,
                ex.body.detail)
        }
        log.error("Unhandled exception", ex)
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.SYSTEM_INTERNAL_ERROR, "An unexpected error occurred")
    }

    private fun respond(
        status: HttpStatusCode,
        code: ErrorCode,
        message: String? = null,
        fieldErrors: Map<String, String>? = null
    ): ResponseEntity<ApiError> = ResponseEntity.status(status).body(ApiError.of(status, code, message, fieldErrors))
}
