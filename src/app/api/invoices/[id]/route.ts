import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Invoice, InvoiceStatus, Inspection, InspectionStatus, TestReport, TestResult, User, UserRole, SectionProgress, ProgressStatus, ProjectSection, SectionStatus, NCR, NCRStatus, NCRSeverity } from '@/models'

// GET single invoice with enriched data
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params

        const invoice = await Invoice.findById(id)
            .populate('projectId', 'name')
            .populate('vendorId', 'name businessName')
            .populate('linkedProgressIds')
            .populate('linkedMachineRentalIds')
            .populate('linkedDeliveryIds')
            .lean()

        if (!invoice) {
            return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Invoice not found' }, { status: 404 })
        }

        // Fetch associated inspections
        const inspections = await Inspection.find({ invoiceId: id })
            .populate('inspectorId', 'name')
            .populate('testReportIds')
            .lean()

        return NextResponse.json({
            success: true,
            data: {
                ...invoice,
                inspections
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}

// PUT approve/reject invoice
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        const user = await User.findById(payload.userId).select('requestedRole').lean()
        if (user?.requestedRole !== UserRole.PROJECT_MANAGER && user?.requestedRole !== UserRole.ADMIN) {
            return NextResponse.json({ success: false, error: 'FORBIDDEN', message: 'Only PM/Admin can approve invoices' }, { status: 403 })
        }

        await dbConnect()
        const { id } = await params
        const body = await request.json()
        const { action, remarks } = body

        const invoice = await Invoice.findById(id)
        if (!invoice) {
            return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Invoice not found' }, { status: 404 })
        }

        if (action === 'APPROVE') {
            // 1. Check Quality Gates: All linked inspections must be COMPLETED
            const inspections = await Inspection.find({ invoiceId: id })
            const pendingInspections = inspections.filter(i => i.status !== InspectionStatus.COMPLETED)

            if (pendingInspections.length > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'QUALITY_GATE_ERROR',
                        message: 'Cannot approve: Linked inspections are still pending.'
                    },
                    { status: 409 }
                )
            }

            // 2. Check Quality Gates: All mandatory tests must have PASSED
            const testReports = await TestReport.find({
                inspectionId: { $in: inspections.map(i => i._id) }
            })
            const failedTests = testReports.filter(t => t.result === TestResult.FAIL)

            if (failedTests.length > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'QUALITY_GATE_ERROR',
                        message: 'Cannot approve: Laboratory tests failed. Rework or clarification required.'
                    },
                    { status: 409 }
                )
            }

            // 3. Check Quality Gates: No OPEN CRITICAL NCRs for linked sections
            const sectionIds = await SectionProgress.find({
                _id: { $in: invoice.linkedProgressIds }
            }).distinct('sectionId')

            const openCriticalNCRs = await NCR.find({
                sectionId: { $in: sectionIds },
                status: { $ne: NCRStatus.CLOSED },
                severity: NCRSeverity.CRITICAL
            })

            if (openCriticalNCRs.length > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'GOVERNANCE_BLOCK',
                        message: `Cannot approve: There are ${openCriticalNCRs.length} OPEN CRITICAL NCRs associated with the sections in this invoice. Quality non-conformance must be resolved first.`
                    },
                    { status: 409 }
                )
            }

            // 3. Finalize Approval
            invoice.status = InvoiceStatus.APPROVED
            await invoice.save()

            // 4. Update linked progress to VERIFIED
            if (invoice.linkedProgressIds && invoice.linkedProgressIds.length > 0) {
                await SectionProgress.updateMany(
                    { _id: { $in: invoice.linkedProgressIds } },
                    {
                        status: ProgressStatus.VERIFIED,
                        verifiedBy: payload.userId,
                        verifiedAt: new Date(),
                    }
                )

                // Check if sections are now 100% and should be marked COMPLETED
                for (const progressId of invoice.linkedProgressIds) {
                    const progress = await SectionProgress.findById(progressId)
                    if (progress && progress.progressPercent >= 100) {
                        await ProjectSection.findByIdAndUpdate(progress.sectionId, { status: SectionStatus.COMPLETED })
                    }
                }
            }

            return NextResponse.json({ success: true, data: invoice, message: 'Invoice approved and progress verified' })

        } else if (action === 'REJECT') {
            invoice.status = InvoiceStatus.REJECTED
            invoice.rejectionReason = remarks || 'Invoice rejected by PM'
            await invoice.save()

            return NextResponse.json({ success: true, data: invoice, message: 'Invoice rejected' })
        }

        return NextResponse.json({ success: false, error: 'INVALID_ACTION', message: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
