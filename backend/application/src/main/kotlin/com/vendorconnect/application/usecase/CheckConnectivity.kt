package com.vendorconnect.application.usecase

import com.vendorconnect.application.port.inbound.ConnectivityQueries
import com.vendorconnect.application.port.outbound.DatabaseProbePort
import com.vendorconnect.domain.shared.ConnectivityReport
import com.vendorconnect.domain.shared.LayerCheck

/**
 * Proves the layers are wired: the web adapter calls this use case, which calls the persistence port.
 * It holds no framework type, so it is constructed by the bootstrap module.
 */
class CheckConnectivity(private val database: DatabaseProbePort) : ConnectivityQueries {
    override fun check(): ConnectivityReport {
        val persistence = try {
            LayerCheck("persistence", true, database.describe())
        } catch (e: RuntimeException) {
            LayerCheck("persistence", false, e.message ?: e.javaClass.simpleName)
        }
        return ConnectivityReport(
            listOf(
                LayerCheck("application", true, "use case CheckConnectivity"),
                LayerCheck("domain", true, "model ConnectivityReport"),
                persistence
            )
        )
    }
}
