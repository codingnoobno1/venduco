package com.vendorconnect.bootstrap

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

/** Starts every layer. The domain is plain Kotlin; use cases and adapters are found by scanning their packages. */
@SpringBootApplication(
    scanBasePackages = [
        "com.vendorconnect.bootstrap", "com.vendorconnect.application.usecase", "com.vendorconnect.web",
        "com.vendorconnect.security", "com.vendorconnect.persistence.jpa", "com.vendorconnect.storage", "com.vendorconnect.jobs"
    ]
)
@ConfigurationPropertiesScan("com.vendorconnect.application.config")
@EnableJpaRepositories("com.vendorconnect.persistence.jpa")
@EntityScan("com.vendorconnect.persistence.jpa")
class VendorConnectApplication

fun main(args: Array<String>) {
    runApplication<VendorConnectApplication>(*args)
}
