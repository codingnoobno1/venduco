package com.vendorconnect.security.error

import com.vendorconnect.domain.shared.ErrorCode
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import java.time.Instant

/**
 * The single error body shape returned by every endpoint (and by the security layer).
 */
data class ApiError(
    val status: Int,
    val error: String,
    val code: String,
    val message: String,
    val fieldErrors: Map<String, String>? = null,
    val timestamp: String = Instant.now().toString()
) {
    companion object {
        fun of(
            status: HttpStatusCode,
            code: ErrorCode,
            message: String? = null,
            fieldErrors: Map<String, String>? = null
        ) = ApiError(
            status = status.value(),
            error = HttpStatus.resolve(status.value())?.reasonPhrase ?: "Error",
            code = code.code,
            message = message ?: code.defaultMessage,
            fieldErrors = fieldErrors
        )
    }
}
