package com.vendorconnect.domain.shared

/**
 * Standard error codes shared across all services.
 * Ensures consistent error reporting regardless of which microservice throws the error.
 */
enum class ErrorCode(val code: String, val defaultMessage: String) {
    // Auth errors
    AUTH_INVALID_CREDENTIALS("AUTH_001", "Invalid email or password"),
    AUTH_TOKEN_EXPIRED("AUTH_002", "Authentication token has expired"),
    AUTH_INSUFFICIENT_PERMISSION("AUTH_003", "Insufficient permissions for this action"),
    AUTH_ACCOUNT_DISABLED("AUTH_004", "Account is deactivated"),
    AUTH_REQUIRED("AUTH_005", "Authentication is required"),
    AUTH_TOKEN_INVALID("AUTH_006", "Authentication token is invalid or expired"),
    ACCESS_ASSIGNMENT_INVALID("AUTH_007", "No usable role assignment for this request"),
    ACCOUNT_NOT_APPROVED("AUTH_008", "This account is awaiting approval"),
    ACCOUNT_PAYMENT_REQUIRED("AUTH_009", "A subscription payment is required"),

    // Entity errors
    ENTITY_NOT_FOUND("ENT_001", "Requested entity not found"),
    ENTITY_DUPLICATE("ENT_002", "Entity already exists"),
    ENTITY_INVALID_STATE("ENT_003", "Invalid state transition"),

    // Validation errors
    VALIDATION_FAILED("VAL_001", "Request validation failed"),
    REQUEST_MALFORMED("VAL_002", "Malformed or missing request body"),

    // HTTP-level errors (unknown route, wrong method, unsupported media type, ...)
    HTTP_ERROR("HTTP_001", "Request could not be processed"),

    // System errors
    SYSTEM_INTERNAL_ERROR("SYS_001", "Internal server error"),
    SYSTEM_SERVICE_UNAVAILABLE("SYS_002", "Service temporarily unavailable")
}
