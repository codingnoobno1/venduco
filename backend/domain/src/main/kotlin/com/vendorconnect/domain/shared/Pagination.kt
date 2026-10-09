package com.vendorconnect.domain.shared

/**
 * Standardized page request DTO for all list endpoints.
 */
data class PageRequest(
    val page: Int = 0,
    val size: Int = 20,
    val sortBy: String = "createdAt",
    val sortDir: String = "desc"
)

/**
 * Standardized page response wrapper.
 */
data class PageResponse<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val isFirst: Boolean,
    val isLast: Boolean
)
