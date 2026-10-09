package com.vendorconnect.application.port.inbound

import com.vendorconnect.domain.shared.ConnectivityReport

interface ConnectivityQueries {
    fun check(): ConnectivityReport
}
