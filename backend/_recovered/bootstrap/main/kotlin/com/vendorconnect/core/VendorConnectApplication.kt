package com.vendorconnect.core

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class VendorConnectApplication

fun main(args: Array<String>) {
    runApplication<VendorConnectApplication>(*args)
}
