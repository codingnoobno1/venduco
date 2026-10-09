package com.vendorconnect.storage.cache

import com.vendorconnect.application.port.outbound.CachePort
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.Clock
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

/**
 * Phase 1: In-memory cache using ConcurrentHashMap, with per-entry TTL.
 * Expired entries are dropped when read and swept periodically on write, so the map cannot grow forever.
 * Zero external dependencies. Works for single-server deployments.
 * Replace with RedisCacheAdapter when horizontal scaling is needed.
 */
@Component
class LocalCacheAdapter(
    private val clock: Clock = Clock.systemUTC()
) : CachePort {

    private class Entry(val value: Any, val expiresAtMillis: Long)

    private val log = LoggerFactory.getLogger(javaClass)
    private val store = ConcurrentHashMap<String, Entry>()
    private val writes = AtomicLong()

    override fun <T> get(key: String, type: Class<T>): T? {
        val entry = store[key] ?: return null
        if (isExpired(entry)) {
            store.remove(key, entry)
            return null
        }
        return if (type.isInstance(entry.value)) type.cast(entry.value) else null
    }

    override fun set(key: String, value: Any, ttlSeconds: Long) {
        require(ttlSeconds > 0) { "ttlSeconds must be positive" }
        store[key] = Entry(value, clock.millis() + ttlSeconds * 1000)
        log.debug("Cache SET: {} (TTL {}s)", key, ttlSeconds)
        if (writes.incrementAndGet() % SWEEP_EVERY_WRITES == 0L) sweepExpired()
    }

    override fun delete(key: String) {
        store.remove(key)
    }

    override fun exists(key: String): Boolean = get(key, Any::class.java) != null

    private fun isExpired(entry: Entry) = clock.millis() >= entry.expiresAtMillis

    private fun sweepExpired() {
        store.entries.removeIf { isExpired(it.value) }
    }

    private companion object {
        const val SWEEP_EVERY_WRITES = 1_000L
    }
}
