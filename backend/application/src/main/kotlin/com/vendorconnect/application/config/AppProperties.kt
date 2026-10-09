package com.vendorconnect.application.config

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

/**
 * Typed binding of the `app.*` configuration tree (see application.yml).
 */
@ConfigurationProperties(prefix = "app")
data class AppProperties(
    val jwt: Jwt,
    val cors: Cors = Cors(),
    val storage: Storage = Storage(),
    val ai: Ai = Ai(),
    val bootstrap: Bootstrap = Bootstrap(),
    val admin: Admin = Admin(),
    val onboarding: Onboarding = Onboarding(),
    val billing: Billing = Billing(),
    val security: Security = Security()
) {
    data class Jwt(
        val secret: String = "",
        val accessTokenTtl: Duration = Duration.ofMinutes(15),
        val refreshTokenTtl: Duration = Duration.ofDays(7),
        val cookieName: String = "vc_token",
        val refreshCookieName: String = "vc_refresh",
        val cookieSecure: Boolean = true,
        val cookieSameSite: String = "Lax"
    )

    data class Cors(val allowedOrigins: List<String> = emptyList())

    data class Storage(val type: String = "local", val localPath: String = "./uploads")

    data class Ai(val enabled: Boolean = false, val baseUrl: String = "http://localhost:8000")

    data class Bootstrap(
        val adminEmail: String = "",
        val adminPassword: String = "",
        val adminName: String = "Administrator"
    )

    /**
     * The admin console. With [port] set to a value other than `server.port` it gets its own listener and is
     * not reachable on the API port (nor the API on its port). 0, or the same value as `server.port`, serves
     * it on the main port. [address] optionally binds that listener to one interface, e.g. 127.0.0.1.
     */
    data class Admin(val port: Int = 0, val address: String = "")

    /**
     * Starting value of the console's "approve automatically" switch (its opposite): when [requireApproval]
     * is on, self-registered users and companies start as PENDING and cannot use the API yet.
     */
    data class Onboarding(val requireApproval: Boolean = false)

    /**
     * @param enforce starting value of the console's "payment enforced" switch. While off, subscriptions and
     *   payments are recorded but nobody is refused for not paying.
     * @param graceDays days after a paid period ends during which access continues.
     * @param requireSubscription when on, an account with no subscription at all is refused too;
     *   when off, only accounts that have been put on a plan must keep it paid.
     */
    data class Billing(val enforce: Boolean = false, val graceDays: Int = 5, val requireSubscription: Boolean = false)

    /**
     * @param dataKey secret from which the key for encrypting sensitive answers (PAN, bank account) is derived.
     *   Blank falls back to the JWT secret; see FieldCipher for why a dedicated value is better.
     */
    data class Security(val dataKey: String = "")
}
