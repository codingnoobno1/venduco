package com.vendorconnect.security

import com.vendorconnect.application.port.outbound.SensitiveValuePort
import com.vendorconnect.application.config.AppProperties
import org.springframework.stereotype.Component
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * AES-256-GCM for individual field values. Each value gets its own random nonce, stored in front
 * of the ciphertext, so equal inputs do not produce equal outputs.
 *
 * The key comes from `app.security.data-key`. If that is not set it is derived from the JWT
 * secret, which keeps a fresh install working but ties the two together: rotating the JWT secret
 * would then make stored values unreadable. Set a dedicated data key before real data is entered.
 */
@Component
class FieldCipher(properties: AppProperties) : SensitiveValuePort {

    private val key = SecretKeySpec(
        MessageDigest.getInstance("SHA-256").digest(
            (KEY_LABEL + properties.security.dataKey.ifBlank { properties.jwt.secret }).toByteArray(Charsets.UTF_8)
        ),
        "AES"
    )
    private val random = SecureRandom()

    override fun protect(plain: String): String {
        val nonce = ByteArray(NONCE_BYTES).also(random::nextBytes)
        val cipher = Cipher.getInstance(TRANSFORMATION).apply { init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(TAG_BITS, nonce)) }
        return PREFIX + Base64.getEncoder().encodeToString(nonce + cipher.doFinal(plain.toByteArray(Charsets.UTF_8)))
    }

    override fun reveal(stored: String): String {
        require(stored.startsWith(PREFIX)) { "Value is not in protected form" }
        val bytes = Base64.getDecoder().decode(stored.removePrefix(PREFIX))
        val cipher = Cipher.getInstance(TRANSFORMATION).apply {
            init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, bytes, 0, NONCE_BYTES))
        }
        return String(cipher.doFinal(bytes, NONCE_BYTES, bytes.size - NONCE_BYTES), Charsets.UTF_8)
    }

    private companion object {
        const val TRANSFORMATION = "AES/GCM/NoPadding"
        const val KEY_LABEL = "vendorconnect:field-encryption:v1:"
        const val PREFIX = "enc:v1:"
        const val NONCE_BYTES = 12
        const val TAG_BITS = 128
    }
}
