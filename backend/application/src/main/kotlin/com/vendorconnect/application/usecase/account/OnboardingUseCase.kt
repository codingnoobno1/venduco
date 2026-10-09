package com.vendorconnect.application.usecase.account

import com.vendorconnect.application.port.outbound.OrganizationDirectoryPort
import com.vendorconnect.application.port.outbound.OrganizationRef
import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.application.usecase.access.AuditRecorder
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.shared.requireDomain
import com.vendorconnect.domain.access.AccessContext
import com.vendorconnect.domain.account.ApprovalStatus
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.user.User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

/**
 * Approval of who may use the platform, company by company or person by person.
 * Callers hold `admin.approval:manage` (checked at the delivery layer).
 */
@Service
class OnboardingUseCase(
    private val users: UserRepositoryPort,
    private val organizations: OrganizationDirectoryPort,
    private val audit: AuditRecorder
) {

    data class CompanyView(val company: OrganizationRef, val members: List<User>) {
        val pendingMembers: Int get() = members.count { it.approvalStatus == ApprovalStatus.PENDING }
    }

    @Transactional(readOnly = true)
    fun companies(): List<CompanyView> {
        val byCompany = users.findAll().filter { it.organizationId != null }.groupBy { it.organizationId }
        return organizations.findAll().map { CompanyView(it, byCompany[it.id].orEmpty()) }
    }

    @Transactional(readOnly = true)
    fun company(id: UUID): CompanyView {
        val company = organizations.findById(id) ?: throw EntityNotFoundException("Company", id)
        return CompanyView(company, users.findAll().filter { it.organizationId == id })
    }

    @Transactional
    fun createCompany(ctx: AccessContext, name: String, type: String): OrganizationRef {
        val trimmed = name.trim()
        requireDomain(trimmed.length in 2..MAX_NAME_LENGTH) { "Company name must be 2 to $MAX_NAME_LENGTH characters." }
        requireDomain(type in COMPANY_TYPES) { "Unknown company type." }
        val company = organizations.create(trimmed, type, ApprovalStatus.APPROVED)
        audit.record(ctx, "COMPANY_CREATED", COMPANY, company.id, "Created company ${company.name} (${company.code})")
        return company
    }

    /**
     * @param includePendingMembers when approving, also approve the company's people who are still
     *   waiting. People who were individually rejected or suspended are never changed by this.
     */
    @Transactional
    fun decideCompany(ctx: AccessContext, id: UUID, status: ApprovalStatus, note: String?, includePendingMembers: Boolean): CompanyView {
        val current = company(id)
        requireReason(status, note)
        requireDomain(current.members.none { it.id == ctx.userId } || status == ApprovalStatus.APPROVED) {
            "You cannot reject or suspend the company you belong to."
        }

        organizations.updateApproval(id, status, note?.trim()?.ifEmpty { null })
        var approvedMembers = 0
        if (status == ApprovalStatus.APPROVED && includePendingMembers) {
            current.members.filter { it.approvalStatus == ApprovalStatus.PENDING }.forEach {
                users.save(it.withApproval(ApprovalStatus.APPROVED, null, ctx.userId))
                approvedMembers++
            }
        }
        audit.record(ctx, "COMPANY_${status.name}", COMPANY, id,
            "${current.company.name}: ${current.company.approvalStatus} → $status" +
                (if (approvedMembers > 0) ", with $approvedMembers pending member(s) approved" else "") +
                (note?.trim()?.takeIf { it.isNotEmpty() }?.let { " ($it)" } ?: ""))
        return company(id)
    }

    @Transactional
    fun decideUser(ctx: AccessContext, id: UUID, status: ApprovalStatus, note: String?): User {
        val user = users.findById(id) ?: throw EntityNotFoundException("User", id)
        requireReason(status, note)
        requireDomain(id != ctx.userId) { "You cannot change your own approval." }

        val saved = users.save(user.withApproval(status, note?.trim()?.ifEmpty { null }, ctx.userId))
        audit.record(ctx, "USER_${status.name}", USER, id,
            "${user.email}: ${user.approvalStatus} → $status" + (saved.approvalNote?.let { " ($it)" } ?: ""))
        return saved
    }

    /** Accounts waiting for a decision: pending companies, plus pending people who are not inside one of those. */
    @Transactional(readOnly = true)
    fun pendingCount(): Int {
        val pendingCompanies = organizations.findAll().filter { it.approvalStatus == ApprovalStatus.PENDING }.mapTo(mutableSetOf()) { it.id }
        return pendingCompanies.size + users.findAll().count { it.approvalStatus == ApprovalStatus.PENDING && it.organizationId !in pendingCompanies }
    }

    /** Approves every company and person still waiting. Rejected and suspended accounts are left as they are. */
    @Transactional
    fun approveAllPending(ctx: AccessContext): Int {
        var approved = 0
        organizations.findAll().filter { it.approvalStatus == ApprovalStatus.PENDING }.forEach {
            decideCompany(ctx, it.id, ApprovalStatus.APPROVED, "Approved in bulk", includePendingMembers = true)
            approved++
        }
        users.findAll().filter { it.approvalStatus == ApprovalStatus.PENDING && it.id != ctx.userId }.forEach {
            decideUser(ctx, it.id, ApprovalStatus.APPROVED, "Approved in bulk")
            approved++
        }
        return approved
    }

    /** Used when a payment is recorded with "approve on payment": approves whoever the subscription is for, if still pending. */
    @Transactional
    fun approveIfPending(ctx: AccessContext, subject: SubjectRef): Boolean = when (subject.type) {
        SubjectType.ORGANIZATION ->
            if (organizations.findById(subject.id)?.approvalStatus == ApprovalStatus.PENDING) {
                decideCompany(ctx, subject.id, ApprovalStatus.APPROVED, "Approved on payment", includePendingMembers = true)
                true
            } else false
        SubjectType.USER ->
            if (users.findById(subject.id)?.approvalStatus == ApprovalStatus.PENDING) {
                decideUser(ctx, subject.id, ApprovalStatus.APPROVED, "Approved on payment")
                true
            } else false
    }

    private fun requireReason(status: ApprovalStatus, note: String?) {
        requireDomain(status != ApprovalStatus.PENDING) { "An account cannot be moved back to pending." }
        requireDomain(status == ApprovalStatus.APPROVED || !note.isNullOrBlank()) { "Give a reason for rejecting or suspending." }
        requireDomain((note?.length ?: 0) <= MAX_NOTE_LENGTH) { "The reason is too long." }
    }

    private fun User.withApproval(status: ApprovalStatus, note: String?, actor: UUID) =
        copy(approvalStatus = status, approvalNote = note, audit = this.audit.copy(updatedAt = Instant.now(), updatedBy = actor.toString()))

    companion object {
        val COMPANY_TYPES = listOf("VENDOR", "EPC_CONTRACTOR", "CONSULTANT", "GOVERNMENT_AUTHORITY")
        private const val COMPANY = "COMPANY"
        private const val USER = "USER"
        private const val MAX_NAME_LENGTH = 160
        private const val MAX_NOTE_LENGTH = 300
    }
}
