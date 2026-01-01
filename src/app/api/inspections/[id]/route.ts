import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Inspection, InspectionStatus, User, UserRole, Invoice, InvoiceStatus } from '@/models'

// GET single inspection
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params

        const inspection = await Inspection.findById(id)
            .populate('inspectorId', 'name')
            .populate('invoiceId')
            .populate('progressId')
            .populate('testReportIds')
            .lean()

        if (!inspection) {
            return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Inspection not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: inspection })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}

// PUT update inspection
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params
        const body = await request.json()
        const { status, remarks, attachmentUrls, testingRequired } = body

        const inspection = await Inspection.findById(id)
        if (!inspection) {
            return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Inspection not found' }, { status: 404 })
        }

        // Check permissions: Inspector or PM/Admin
        const user = await User.findById(payload.userId).select('requestedRole').lean()
        const isPMOrAdmin = user?.requestedRole === UserRole.PROJECT_MANAGER || user?.requestedRole === UserRole.ADMIN
        const isInspector = String(inspection.inspectorId) === payload.userId

        if (!isPMOrAdmin && !isInspector) {
            return NextResponse.json({ success: false, error: 'FORBIDDEN', message: 'Not authorized' }, { status: 403 })
        }

        if (status) inspection.status = status
        if (remarks) inspection.remarks = remarks
        if (attachmentUrls) inspection.attachmentUrls = attachmentUrls
        if (testingRequired !== undefined) inspection.testingRequired = testingRequired

        if (status === InspectionStatus.COMPLETED) {
            inspection.completedDate = new Date()

            // If linked to invoice and testing is required, move invoice to TESTING_REQUIRED
            if (inspection.invoiceId && inspection.testingRequired) {
                await Invoice.findByIdAndUpdate(inspection.invoiceId, { status: InvoiceStatus.TESTING_REQUIRED })
            }
        }

        await inspection.save()

        return NextResponse.json({ success: true, data: inspection, message: 'Inspection updated successfully' })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
