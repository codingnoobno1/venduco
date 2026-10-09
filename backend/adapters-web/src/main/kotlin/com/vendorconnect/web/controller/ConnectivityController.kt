package com.vendorconnect.web.controller

import com.vendorconnect.application.port.inbound.ConnectivityQueries
import com.vendorconnect.security.PublicEndpoint
import com.vendorconnect.web.response.ConnectivityResponse
import com.vendorconnect.web.response.LayerResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/connectivity")
class ConnectivityController(private val connectivity: ConnectivityQueries) {

    @GetMapping
    @PublicEndpoint
    fun check(): ResponseEntity<ConnectivityResponse> {
        val report = connectivity.check()
        val layers = listOf(LayerResponse("web", true, "controller ConnectivityController")) +
            report.checks.map { LayerResponse(it.layer, it.reachable, it.detail) }
        val body = ConnectivityResponse(if (report.allReachable) "CONNECTED" else "DEGRADED", layers)
        return ResponseEntity.status(if (report.allReachable) 200 else 503).body(body)
    }
}
