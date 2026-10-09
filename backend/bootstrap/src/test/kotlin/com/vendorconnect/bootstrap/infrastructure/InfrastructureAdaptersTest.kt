package com.vendorconnect.bootstrap.infrastructure

import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.storage.cache.LocalCacheAdapter
import com.vendorconnect.application.config.AppProperties
import com.vendorconnect.storage.LocalFileStorageAdapter
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Files
import java.nio.file.Path
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class InfrastructureAdaptersTest {

    private class MutableClock(var now: Instant) : Clock() {
        override fun getZone() = ZoneOffset.UTC
        override fun withZone(zone: java.time.ZoneId?) = this
        override fun instant() = now
    }

    @Test
    fun `cache entries expire after their TTL`() {
        val clock = MutableClock(Instant.parse("2026-01-01T00:00:00Z"))
        val cache = LocalCacheAdapter(clock)
        cache.set("k", "v", ttlSeconds = 10)

        assertEquals("v", cache.get("k", String::class.java))
        clock.now = clock.now.plus(Duration.ofSeconds(11))
        assertNull(cache.get("k", String::class.java))
        assertFalse(cache.exists("k"))
    }

    @Test
    fun `cache returns null instead of a wrongly typed value`() {
        val cache = LocalCacheAdapter()
        cache.set("k", 42)
        assertNull(cache.get("k", String::class.java))
        assertEquals(42, cache.get("k", Integer::class.java)?.toInt())
    }

    @Test
    fun `file storage rejects paths that escape the storage root`(@TempDir dir: Path) {
        val root = dir.resolve("uploads")
        val storage = LocalFileStorageAdapter(AppProperties(
            jwt = AppProperties.Jwt(),
            storage = AppProperties.Storage(localPath = root.toString())
        ))
        Files.createDirectories(root)
        Files.writeString(dir.resolve("secret.txt"), "top secret")

        assertThrows<DomainException> { storage.retrieve("../secret.txt") }
        assertThrows<DomainException> { storage.delete("../secret.txt") }
        assertThrows<DomainException> { storage.exists(dir.resolve("secret.txt").toString()) }
        assertTrue(Files.exists(dir.resolve("secret.txt")))
    }

    @Test
    fun `file storage strips directory components from uploaded names`(@TempDir dir: Path) {
        val root = dir.resolve("uploads")
        val storage = LocalFileStorageAdapter(AppProperties(
            jwt = AppProperties.Jwt(),
            storage = AppProperties.Storage(localPath = root.toString())
        ))
        val stored = storage.store("../../evil.sh", "x".byteInputStream(), "text/plain")

        assertTrue(stored.endsWith("_evil.sh"))
        assertTrue(Files.exists(root.resolve(stored)))
        assertEquals("x", String(storage.retrieve(stored)!!))
    }
}
