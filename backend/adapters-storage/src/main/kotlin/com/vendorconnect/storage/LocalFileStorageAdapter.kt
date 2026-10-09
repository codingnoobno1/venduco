package com.vendorconnect.storage

import com.vendorconnect.application.port.outbound.FileStoragePort
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.application.config.AppProperties
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.InvalidPathException
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID

/**
 * Phase 1: Local filesystem storage.
 * Saves files to ./uploads/ directory. Zero cloud dependencies.
 * Replace with S3StorageAdapter when cloud storage is needed.
 *
 * Every path is resolved inside the storage root; `../` and absolute paths are rejected.
 */
@Component
class LocalFileStorageAdapter(
    properties: AppProperties
) : FileStoragePort {

    private val log = LoggerFactory.getLogger(javaClass)
    private val basePath = properties.storage.localPath
    private val root: Path by lazy {
        Paths.get(basePath).toAbsolutePath().normalize().also { Files.createDirectories(it) }
    }

    override fun store(fileName: String, content: InputStream, contentType: String): String {
        val uniqueName = "${UUID.randomUUID()}_${sanitize(fileName)}"
        val targetPath = resolveInsideRoot(uniqueName)
        Files.copy(content, targetPath)
        log.info("Stored file: {}", targetPath)
        return uniqueName
    }

    override fun retrieve(filePath: String): ByteArray? {
        val path = resolveInsideRoot(filePath)
        return if (Files.isRegularFile(path)) Files.readAllBytes(path) else null
    }

    override fun delete(filePath: String): Boolean {
        return Files.deleteIfExists(resolveInsideRoot(filePath))
    }

    override fun exists(filePath: String): Boolean {
        return Files.isRegularFile(resolveInsideRoot(filePath))
    }

    private fun resolveInsideRoot(relativePath: String): Path {
        val resolved = try {
            root.resolve(relativePath).normalize()
        } catch (e: InvalidPathException) {
            throw DomainException("Invalid file path")
        }
        if (!resolved.startsWith(root) || resolved == root) throw DomainException("Invalid file path")
        return resolved
    }

    /** Keeps only the last path segment and a conservative character set. */
    private fun sanitize(fileName: String): String =
        fileName.substringAfterLast('/').substringAfterLast('\\')
            .replace(UNSAFE_CHARS, "_")
            .trimStart('.')
            .take(MAX_NAME_LENGTH)
            .ifBlank { "file" }

    private companion object {
        val UNSAFE_CHARS = Regex("[^A-Za-z0-9._-]")
        const val MAX_NAME_LENGTH = 100
    }
}
