package com.vendorconnect.web.admin

import com.vendorconnect.application.usecase.access.RoleAdminUseCase
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.PermissionDef
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.access.Portal
import com.vendorconnect.domain.access.Role
import com.vendorconnect.domain.access.ScopeLevel
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.util.UUID

@Controller
@RequestMapping("/admin/roles")
class AdminRolePageController(private val roles: RoleAdminUseCase) {

    /** One row of the permission grid: a resource and its permissions. */
    data class PermissionGroup(val resource: String, val permissions: List<PermissionDef>)

    data class RoleLink(val id: UUID, val name: String, val system: Boolean)

    data class PermissionHolders(val permission: PermissionDef, val roles: List<RoleLink>)

    data class PermissionHoldersGroup(val resource: String, val permissions: List<PermissionHolders>)

    /** What the new-role form posts, kept so a rejected form can be shown again as it was filled in. */
    data class RoleForm(
        val key: String = "",
        val name: String = "",
        val description: String = "",
        val portal: String = Portal.BUYER.name,
        val scopeLevel: String = ScopeLevel.PROJECT.name,
        val defaultDashboardKey: String = "",
        val permissions: Set<String> = emptySet()
    )

    @GetMapping
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun list(model: Model): String {
        model.addAttribute("roles", roles.list())
        return "admin/roles"
    }

    /** Every permission and which roles hold it: the other way round from the role pages. */
    @GetMapping("/permissions")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun permissions(model: Model): String {
        val active = roles.list().filter { it.isActive }
        model.addAttribute("groups", Permissions.all.groupBy { it.resource }.map { (resource, permissions) ->
            PermissionHoldersGroup(resource, permissions.map { p ->
                PermissionHolders(p, active.filter { p.key in it.permissions }.map { RoleLink(it.id, it.name, it.isSystem) })
            })
        })
        model.addAttribute("permissionCount", Permissions.all.size)
        model.addAttribute("roleCount", active.size)
        return "admin/permissions"
    }

    @GetMapping("/new")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun newForm(model: Model): String = form(model, RoleForm(), null)

    @PostMapping
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun create(
        @RequestParam key: String,
        @RequestParam name: String,
        @RequestParam(required = false) description: String?,
        @RequestParam portal: Portal,
        @RequestParam scopeLevel: ScopeLevel,
        @RequestParam(required = false) defaultDashboardKey: String?,
        @RequestParam(required = false) permissions: Set<String>?,
        ctx: AccessContext,
        model: Model,
        redirect: RedirectAttributes
    ): String {
        val submitted = RoleForm(key.trim().uppercase(), name, description.orEmpty(), portal.name, scopeLevel.name,
            defaultDashboardKey.orEmpty(), permissions.orEmpty())
        return try {
            requireFilled(submitted.name, submitted.permissions)
            val role = roles.create(
                ctx,
                RoleAdminUseCase.CreateRoleCommand(submitted.key, name, description.blankToNull(), portal, scopeLevel,
                    submitted.permissions, defaultDashboardKey.blankToNull())
            )
            redirect.addFlashAttribute(Flash.SUCCESS, "Role ${role.key} created.")
            "redirect:/admin/roles/${role.id}"
        } catch (e: DomainException) {
            form(model, submitted, e.message)
        }
    }

    @GetMapping("/{id}")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun detail(@PathVariable id: UUID, model: Model): String {
        val role = roles.get(id)
        model.addAttribute("role", role)
        model.addAttribute("groups", permissionGroups())
        model.addAttribute("cloneKey", suggestedCloneKey(role))
        return "admin/role"
    }

    @PostMapping("/{id}")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun update(
        @PathVariable id: UUID,
        @RequestParam name: String,
        @RequestParam(required = false) description: String?,
        @RequestParam(required = false) defaultDashboardKey: String?,
        @RequestParam(required = false) permissions: Set<String>?,
        @RequestParam(defaultValue = "false") active: Boolean,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        requireFilled(name, permissions.orEmpty())
        val role = roles.update(
            ctx, id,
            RoleAdminUseCase.UpdateRoleCommand(name, description.blankToNull(), permissions.orEmpty(), defaultDashboardKey.blankToNull(), active)
        )
        redirect.addFlashAttribute(Flash.SUCCESS, "Role ${role.key} saved. The change applies to its holders from their next request.")
        return "redirect:/admin/roles/$id"
    }

    @PostMapping("/{id}/clone")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun clone(@PathVariable id: UUID, @RequestParam key: String, @RequestParam name: String, ctx: AccessContext,
              redirect: RedirectAttributes): String {
        val copy = roles.clone(ctx, id, key.trim().uppercase(), name)
        redirect.addFlashAttribute(Flash.SUCCESS, "Created ${copy.key} as a copy. Adjust its permissions below.")
        return "redirect:/admin/roles/${copy.id}"
    }

    @PostMapping("/{id}/delete")
    @RequirePermission(Permissions.ADMIN_ROLE_MANAGE)
    fun delete(@PathVariable id: UUID, ctx: AccessContext, redirect: RedirectAttributes): String {
        val key = roles.get(id).key
        roles.delete(ctx, id)
        redirect.addFlashAttribute(Flash.SUCCESS, "Role $key removed.")
        return "redirect:/admin/roles"
    }

    private fun form(model: Model, form: RoleForm, error: String?): String {
        model.addAttribute("form", form)
        model.addAttribute("error", error)
        model.addAttribute("groups", permissionGroups())
        model.addAttribute("portals", Portal.entries.map { it.name })
        model.addAttribute("scopeLevels", ScopeLevel.entries.map { it.name })
        return "admin/role-new"
    }

    private fun requireFilled(name: String, permissions: Set<String>) {
        if (name.isBlank()) throw DomainException("Give the role a name.")
        if (permissions.isEmpty()) throw DomainException("Select at least one permission.")
    }

    private fun permissionGroups(): List<PermissionGroup> =
        Permissions.all.groupBy { it.resource }.map { (resource, permissions) -> PermissionGroup(resource, permissions) }

    private fun suggestedCloneKey(role: Role): String = "${role.key.take(MAX_KEY_LENGTH - COPY_SUFFIX.length)}$COPY_SUFFIX"

    private companion object {
        const val COPY_SUFFIX = "_COPY"
        const val MAX_KEY_LENGTH = 49
    }
}
