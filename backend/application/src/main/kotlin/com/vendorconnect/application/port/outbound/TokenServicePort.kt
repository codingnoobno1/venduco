package com.vendorconnect.application.port.outbound

import com.vendorconnect.domain.user.User
import java.util.UUID

/**
 * Port for issuing and reading authentication tokens.
 * Phase 1: JwtTokenService (HMAC-signed JWTs)
 */
interface TokenServicePort {
    fun issueAccessToken(user: User): String
    fun issueRefreshToken(userId: UUID): String

    /** Returns the user id of a valid, unexpired refresh token, or null. Access tokens are rejected. */
    fun parseRefreshToken(token: String): UUID?
}
