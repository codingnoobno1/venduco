package com.vendorconnect.web.admin

import com.vendorconnect.application.port.outbound.BidRepositoryPort
import com.vendorconnect.application.port.outbound.TenderRepositoryPort
import com.vendorconnect.application.usecase.access.MyAccessUseCase
import com.vendorconnect.domain.tender.BidStatus
import com.vendorconnect.domain.tender.Tender
import com.vendorconnect.domain.tender.TenderStatus
import com.vendorconnect.application.usecase.account.BillingUseCase
import com.vendorconnect.application.usecase.account.OnboardingUseCase
import com.vendorconnect.application.usecase.account.PlatformSettingsService
import com.vendorconnect.application.usecase.partner.QualificationUseCase
import com.vendorconnect.application.usecase.user.UserUseCase
import com.vendorconnect.domain.shared.AssignmentInvalidException
import com.vendorconnect.domain.shared.DomainException
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.InsufficientPermissionException
import com.vendorconnect.domain.access.Permissions
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.account.Standing
import com.vendorconnect.domain.partner.QualificationStatus
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.security.AdminPrincipal
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.ui.Model
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.support.RequestContextUtils
import java.net.URI
import java.text.DecimalFormat
import java.text.NumberFormat
import java.time.LocalDate
import java.util.Locale
import java.util.UUID

/** Flash attribute names shared by controllers and the layout template. */
object Flash {
    const val SUCCESS = "flashSuccess"
    const val ERROR = "flashError"
}

/** Blank form fields arrive as empty strings; these turn them into "not provided". */
fun String?.blankToNull(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

fun String?.toUuidOrNull(): UUID? = blankToNull()?.let(UUID::fromString)

fun String?.toDateOrNull(): LocalDate? = blankToNull()?.let(LocalDate::parse)

/** Money typed into a form in whole currency units (rupees). Empty means "none". */
fun parseMoney(input: String?, label: String): Money? = input.blankToNull()?.let {
    val amount = it.replace(",", "").toBigDecimalOrNull() ?: throw DomainException("$label must be a number.")
    if (amount.signum() < 0) throw DomainException("$label cannot be negative.")
    Money(amount)
}

/** Money for display, with Indian digit grouping: "INR 12,50,000.00". */
fun Money.display(): String = "${currency.currencyCode} " + INDIAN_GROUPING.get().format(amount)

private val INDIAN_GROUPING = ThreadLocal.withInitial {
    (NumberFormat.getNumberInstance(Locale.Builder().setLanguage("en").setRegion("IN").build()) as DecimalFormat)
        .apply { minimumFractionDigits = 2; maximumFractionDigits = 2 }
}

/** "AWAITING_PAYMENT" as "Awaiting payment". */
fun Enum<*>.label(): String = name.lowercase().replace('_', ' ').replaceFirstChar { it.uppercase() }

/**
 * Where to go after a form post: the page named by the form, but only if it is inside the console.
 * A form field is user input like any other, so it is never followed elsewhere.
 */
fun returnTo(requested: String?, fallback: String): String =
    requested.blankToNull()?.takeIf { it.startsWith("/admin/") && "//" !in it && '\\' !in it && ':' !in it } ?: fallback

/**
 * Applies to the admin console's controllers only, and is ordered ahead of the API's JSON
 * exception handler so that console errors are rendered as pages.
 */
@ControllerAdvice(basePackageClasses = [AdminUiAdvice::class])
@Order(Ordered.HIGHEST_PRECEDENCE)
class AdminUiAdvice(
    private val myAccess: MyAccessUseCase,
    private val onboarding: OnboardingUseCase,
    private val users: UserUseCase,
    private val billing: BillingUseCase,
    private val settings: PlatformSettingsService,
    private val qualification: QualificationUseCase,
    private val tenders: TenderRepositoryPort,
    private val bids: BidRepositoryPort
) {

    private val log = LoggerFactory.getLogger(javaClass)

    /** What every page's layout needs: who is signed in and which sections they may open. */
    @ModelAttribute
    fun layout(model: Model) {
        model.addAllAttributes(layoutAttributes())
    }

    /**
     * A refused change sends the user back to the page they came from with the reason shown;
     * a refused page view renders the error page.
     */
    @ExceptionHandler(DomainException::class)
    fun domainError(ex: DomainException, request: HttpServletRequest): ModelAndView {
        val status = when (ex) {
            is EntityNotFoundException -> HttpStatus.NOT_FOUND
            is InsufficientPermissionException, is AssignmentInvalidException -> HttpStatus.FORBIDDEN
            else -> HttpStatus.BAD_REQUEST
        }
        if (request.method == "POST" && status != HttpStatus.FORBIDDEN) {
            RequestContextUtils.getOutputFlashMap(request)[Flash.ERROR] = ex.message
            return ModelAndView("redirect:" + cameFrom(request))
        }
        return errorPage(status, ex.message ?: status.reasonPhrase)
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException::class, MissingServletRequestParameterException::class,
        IllegalArgumentException::class, java.time.format.DateTimeParseException::class)
    fun badInput(ex: Exception): ModelAndView = errorPage(HttpStatus.BAD_REQUEST, "The request was not valid.")

    @ExceptionHandler(Exception::class)
    fun unexpected(ex: Exception): ModelAndView {
        log.error("Unhandled exception in admin console", ex)
        return errorPage(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. The error has been logged.")
    }

    private fun errorPage(status: HttpStatus, message: String) =
        ModelAndView("admin/error", layoutAttributes() + mapOf("status" to status.value(), "reason" to status.reasonPhrase, "message" to message))
            .apply { this.status = status }

    private fun layoutAttributes(): Map<String, Any?> {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? AdminPrincipal
        val permissions = principal?.let {
            runCatching { myAccess.access(it.userId, it.assignmentId).context.permissions }.getOrDefault(emptySet())
        } ?: emptySet()
        return mapOf("me" to principal, "perms" to permissions, "paymentEnforced" to settings.current().paymentEnforced) +
            navigationCounts(permissions)
    }

    /** The numbers shown next to navigation entries: work that is waiting for somebody. */
    private fun navigationCounts(permissions: Set<String>): Map<String, Any?> = runCatching {
        buildMap<String, Any?> {
            if (Permissions.ADMIN_APPROVAL_MANAGE in permissions) {
                val pendingCompanies = onboarding.companies().count { it.company.approvalStatus == ApprovalStatus.PENDING }
                val pendingPeople = users.listAll().count { it.approvalStatus == ApprovalStatus.PENDING }
                put("navPendingApprovals", pendingCompanies + pendingPeople)
            }
            if (Permissions.QUALIFICATION_READ in permissions) {
                put("navQualificationsWaiting", qualification.all().count { it.status == QualificationStatus.SUBMITTED })
            }
            if (Permissions.BID_EVALUATE in permissions) {
                put("navTendersAwaitingAward", tenders.findAll().count { awaitingAward(it) })
            }
            if (Permissions.ADMIN_BILLING_MANAGE in permissions && settings.current().paymentEnforced) {
                put("navBillingAttention", billing.subscriptions().count { it.standing in NEEDS_PAYMENT })
            }
        }
    }.getOrDefault(emptyMap())


    /** Closed for bidding (closing date passed), not awarded or cancelled, and at least one bid to choose from. */
    private fun awaitingAward(tender: Tender): Boolean {
        val closed = tender.status == TenderStatus.CLOSED || tender.status == TenderStatus.UNDER_REVIEW ||
            (tender.status == TenderStatus.PUBLISHED && tender.closingDate?.let { LocalDate.now().isAfter(it) } == true)
        return closed && bids.findAward(tender.id) == null && bids.findByTender(tender.id).any { it.status == BidStatus.SUBMITTED }
    }

    /** The Referer, but only as a path inside the console: never redirect to wherever a header points. */
    private fun cameFrom(request: HttpServletRequest): String {
        val referer = runCatching { URI(request.getHeader("Referer").orEmpty()) }.getOrNull()
        val path = referer?.rawPath?.removePrefix(request.contextPath).orEmpty()
        if (path != ADMIN_ROOT && !path.startsWith("$ADMIN_ROOT/")) return ADMIN_ROOT
        return path + (referer?.rawQuery?.let { "?$it" } ?: "")
    }

    private companion object {
        const val ADMIN_ROOT = "/admin"
        val NEEDS_PAYMENT = setOf(Standing.AWAITING_PAYMENT, Standing.GRACE, Standing.OVERDUE)
    }
}
