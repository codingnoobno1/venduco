package com.vendorconnect.application.port.outbound

/**
 * Port for caching.
 * Phase 1: LocalCacheAdapter (ConcurrentHashMap)
 * Phase 3: RedisCacheAdapter
 */
interface CachePort {
    fun <T> get(key: String, type: Class<T>): T?
    fun set(key: String, value: Any, ttlSeconds: Long = 3600)
    fun delete(key: String)
    fun exists(key: String): Boolean
}
