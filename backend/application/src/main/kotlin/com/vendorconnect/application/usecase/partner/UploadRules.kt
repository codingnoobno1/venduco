package com.vendorconnect.application.usecase.partner

/** What partners may upload, shared by qualification documents and bid quotations. */
object UploadRules {
    const val MAX_BYTES = 10 * 1024 * 1024
    const val MAX_FILE_NAME = 120
    const val REFUSAL = "Upload a PDF, JPG or PNG file."

    /**
     * The content type judged from the file's own first bytes, or null if it is not one we accept.
     * A file name or a browser-supplied type proves nothing about what a file is.
     */
    fun sniff(bytes: ByteArray): String? = when {
        bytes.startsWith(0x25, 0x50, 0x44, 0x46) -> "application/pdf"            // %PDF
        bytes.startsWith(0xFF, 0xD8, 0xFF) -> "image/jpeg"
        bytes.startsWith(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A) -> "image/png"
        else -> null
    }

    fun displayName(fileName: String): String = fileName.takeLast(MAX_FILE_NAME).ifBlank { "document" }

    private fun ByteArray.startsWith(vararg signature: Int): Boolean =
        size >= signature.size && signature.indices.all { this[it] == signature[it].toByte() }
}
