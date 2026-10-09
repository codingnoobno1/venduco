package com.vendorconnect.domain.shared

/** One layer's answer to a connectivity check. */
data class LayerCheck(val layer: String, val reachable: Boolean, val detail: String)

/** The answers of every layer a connectivity request passed through, outermost first. */
data class ConnectivityReport(val checks: List<LayerCheck>) {
    val allReachable: Boolean get() = checks.all { it.reachable }
}
