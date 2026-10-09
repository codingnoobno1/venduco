package com.vendorconnect.bootstrap.startup

import com.vendorconnect.application.usecase.access.AccessProvisioningService
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

/**
 * Brings the persisted access model up to date on every start: system roles are rewritten from
 * the code, and users that have no role assignment yet get the one matching their legacy role.
 */
@Component
@Order(AccessBootstrap.ORDER)
class AccessBootstrap(private val provisioning: AccessProvisioningService) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        provisioning.seedSystemRoles()
        provisioning.backfillDefaultAssignments()
    }

    companion object {
        const val ORDER = 0
    }
}
