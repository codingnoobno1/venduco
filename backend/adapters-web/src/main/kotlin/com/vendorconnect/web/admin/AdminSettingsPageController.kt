package com.vendorconnect.web.admin

import com.vendorconnect.application.usecase.account.BillingUseCase
import com.vendorconnect.application.usecase.account.OnboardingUseCase
import com.vendorconnect.application.usecase.account.PlatformSettingsService
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.security.RequirePermission
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.mvc.support.RedirectAttributes

/** The platform-wide switches: automatic approval of registrations, and whether unpaid subscriptions block access. */
@Controller
@RequestMapping("/admin/settings")
class AdminSettingsPageController(
    private val settings: PlatformSettingsService,
    private val onboarding: OnboardingUseCase,
    private val billing: BillingUseCase
) {

    @GetMapping
    @RequirePermission(Permissions.ADMIN_SETTINGS_MANAGE)
    fun page(ctx: AccessContext, model: Model): String {
        model.addAttribute("settings", settings.current())
        model.addAttribute("waiting", onboarding.pendingCount())
        model.addAttribute("canApprove", ctx.has(Permissions.ADMIN_APPROVAL_MANAGE))
        // What switching enforcement on would do today, so it is not a leap in the dark.
        model.addAttribute("wouldBeBlocked", billing.subscriptions().count { !it.standing.allowsAccess })
        return "admin/settings"
    }

    /** Unticked checkboxes are simply absent from the post, hence the defaults. */
    @PostMapping
    @RequirePermission(Permissions.ADMIN_SETTINGS_MANAGE)
    fun save(
        @RequestParam(defaultValue = "false") autoApproveRegistrations: Boolean,
        @RequestParam(defaultValue = "false") paymentEnforced: Boolean,
        @RequestParam(defaultValue = "false") approveWaiting: Boolean,
        ctx: AccessContext,
        redirect: RedirectAttributes
    ): String {
        val saved = settings.update(ctx, autoApproveRegistrations, paymentEnforced)
        // Approving people is its own authority; holding the settings permission alone does not carry it.
        val approved = if (approveWaiting && saved.autoApproveRegistrations) {
            ctx.require(Permissions.ADMIN_APPROVAL_MANAGE)
            onboarding.approveAllPending(ctx)
        } else 0
        redirect.addFlashAttribute(Flash.SUCCESS,
            "Settings saved. New registrations are ${if (saved.autoApproveRegistrations) "approved automatically" else "held for approval"}; " +
                "payment is ${if (saved.paymentEnforced) "enforced" else "not enforced"}." +
                if (approved > 0) " $approved waiting account(s) approved." else "")
        return "redirect:/admin/settings"
    }
}
