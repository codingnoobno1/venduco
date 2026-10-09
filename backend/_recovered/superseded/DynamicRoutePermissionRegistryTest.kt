package com.vendorconnect.security

import com.vendorconnect.domain.user.UserRole
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class DynamicRoutePermissionRegistryTest {

    private val registry = DynamicRoutePermissionRegistry()

    @Test
    fun `all UI routes use the generated dashboard namespace`() {
        val routes = registry.getAllUiRoutes()

        assertTrue(routes.isNotEmpty())
        assertTrue(routes.all { it.path.startsWith("/dashboard/") })
        assertFalse(routes.any { it.path.startsWith("/portal/") })
    }

    @Test
    fun `each role receives only its own dashboard routes`() {
        val expectedRoots = mapOf(
            UserRole.ADMIN to "/dashboard/admin",
            UserRole.PROJECT_HEAD to "/dashboard/pm",
            UserRole.EPC_MANAGER to "/dashboard/pm",
            UserRole.SUPERVISOR to "/dashboard/supervisor",
            UserRole.VENDOR to "/dashboard/vendor",
            UserRole.CONSULTANT to "/dashboard/consultant",
            UserRole.CONTRACTOR to "/dashboard/contractor",
            UserRole.SUBCONTRACTOR to "/dashboard/subcontractor"
        )

        expectedRoots.forEach { (role, root) ->
            val routes = registry.getAccessibleUiRoutes(role)
            assertTrue(routes.isNotEmpty(), "Expected navigation routes for $role")
            assertEquals(root, routes.first().path)
            assertTrue(routes.all { it.path == root || it.path.startsWith("$root/") })
            assertTrue(routes.all { role in it.allowedRoles })
        }
    }

    @Test
    fun `a route requires both role membership and a current permission`() {
        registry.updateRolePermissions(UserRole.VENDOR, emptySet())

        assertTrue(registry.getAccessibleUiRoutes(UserRole.VENDOR).isEmpty())
    }
}
