package com.vendorconnect.bootstrap.wiring

import com.vendorconnect.application.port.inbound.ConnectivityQueries
import com.vendorconnect.application.port.outbound.DatabaseProbePort
import com.vendorconnect.application.usecase.CheckConnectivity
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/** Builds the use cases from the ports the adapters implement. No business rule belongs here. */
@Configuration
class ApplicationWiring {
    @Bean
    fun connectivityQueries(database: DatabaseProbePort): ConnectivityQueries = CheckConnectivity(database)
}
