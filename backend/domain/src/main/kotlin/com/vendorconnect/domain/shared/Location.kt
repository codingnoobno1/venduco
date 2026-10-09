package com.vendorconnect.domain.shared

import com.vendorconnect.domain.shared.requireDomain

/**
 * Value object for geographic locations along a corridor.
 */
data class Location(
    val latitude: Double,
    val longitude: Double,
    val label: String? = null,
    val sectionName: String? = null
) {
    init {
        requireDomain(latitude in -90.0..90.0) { "Invalid latitude" }
        requireDomain(longitude in -180.0..180.0) { "Invalid longitude" }
    }
}
