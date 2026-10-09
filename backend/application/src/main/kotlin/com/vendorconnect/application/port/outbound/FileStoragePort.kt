package com.vendorconnect.application.port.outbound

import java.io.InputStream

/**
 * Port for file storage.
 * Phase 1: LocalFileStorageAdapter (saves to ./uploads/)
 * Phase 3: S3StorageAdapter
 */
interface FileStoragePort {
    fun store(fileName: String, content: InputStream, contentType: String): String
    fun retrieve(filePath: String): ByteArray?
    fun delete(filePath: String): Boolean
    fun exists(filePath: String): Boolean
}
