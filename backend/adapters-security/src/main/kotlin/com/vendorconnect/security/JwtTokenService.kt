package com.vendorconnect.security

import com.vendorconnect.application.port.outbound.TokenServicePort
import com.vendorconnect.domain.user.User
import com.vendorconnect.application.config.AppProperties
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.time.Duration
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

/**
 * JWT token service for creating and validating tokens.
 * Tokens are delivered via HttpOnly cookies — never exposed to JavaScript.
 *
 * Every token carries a `typ` claim so a refresh token can never be used as an access token
 * (and vice versa).
 */
@Component
class JwtTokenService(properties: AppProperties) : TokenServicePort {

    data class AccessClaims(val userId: UUID, val role: String)

    private val jwt = properties.jwt

    private val key: SecretKey = run {
        val bytes = jwt.secret.toByteArray(Charsets.UTF_8)
        require(bytes.size >= MIN_SECRET_BYTES) {
            "app.jwt.secret must be at least $MIN_SECRET_BYTES bytes. Set the JWT_SECRET environment variable " +
                "(or run with the 'dev' profile for local development)."
        }
        Keys.hmacShaKeyFor(bytes)
    }

    private val parser = Jwts.parser().verifyWith(key).build()

    override fun issueAccessToken(user: User): String =
        build(user.id, TYPE_ACCESS, jwt.accessTokenTtl) { claim(CLAIM_ROLE, user.role.name) }

    override fun issueRefreshToken(userId: UUID): String =
        build(userId, TYPE_REFRESH, jwt.refreshTokenTtl) { this }

    /** Parses and verifies an access token once, returning its claims, or null if invalid/expired/wrong type. */
    fun parseAccessToken(token: String): AccessClaims? = parse(token, TYPE_ACCESS) { claims ->
        val role = claims[CLAIM_ROLE] as? String ?: return@parse null
        AccessClaims(UUID.fromString(claims.subject), role)
    }

    override fun parseRefreshToken(token: String): UUID? = parse(token, TYPE_REFRESH) { claims ->
        UUID.fromString(claims.subject)
    }

    private inline fun build(
        subject: UUID,
        type: String,
        ttl: Duration,
        extra: io.jsonwebtoken.JwtBuilder.() -> io.jsonwebtoken.JwtBuilder
    ): String {
        val now = System.currentTimeMillis()
        return Jwts.builder()
            .subject(subject.toString())
            .claim(CLAIM_TYPE, type)
            .extra()
            .issuedAt(Date(now))
            .expiration(Date(now + ttl.toMillis()))
            .signWith(key)
            .compact()
    }

    private fun <T> parse(token: String, expectedType: String, read: (Claims) -> T?): T? = try {
        val claims = parser.parseSignedClaims(token).payload
        if (claims[CLAIM_TYPE] == expectedType) read(claims) else null
    } catch (e: JwtException) {
        null
    } catch (e: IllegalArgumentException) {
        null  // blank token or malformed subject UUID
    }

    private companion object {
        const val MIN_SECRET_BYTES = 32
        const val CLAIM_TYPE = "typ"
        const val CLAIM_ROLE = "role"
        const val TYPE_ACCESS = "access"
        const val TYPE_REFRESH = "refresh"
    }
}
