import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Inspection, InspectionStatus, User, UserRole, InvoiceStatus, Invoice } from '@/models'

// GET inspections
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { searchParams } = new URL(request.url)
        const inspectorId = searchParams.get('inspectorId')
        const status = searchParams.get('status')
        const invoiceId = searchParams.get('invoiceId')

        const query: any = {}
        if (inspectorId) query.inspectorId = inspectorId
        if (status) query.status = status
        if (invoiceId) query.invoiceId = invoiceId

        // If user is an inspector (SUPERVISOR), they only see theirs
        const user = await User.findById(payload.userId).select('requestedRole').lean()
        if (user?.requestedRole === UserRole.SUPERVISOR) {
            query.inspectorId = payload.userId
        }

        const inspections = await Inspection.find(query)
            .sort({ scheduledDate: 1 })
            .populate('inspectorId', 'name')
            .populate('invoiceId', 'invoiceNumber invoiceType')
            .populate('progressId')
            .lean()

        return NextResponse.json({
            success: true,
            data: inspections,
            count: inspections.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new inspection assignment
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        const user = await User.findById(payload.userId).select('requestedRole').lean()
        if (user?.requestedRole !== UserRole.PROJECT_MANAGER && user?.requestedRole !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only PM/Admin can assign inspections' },
                { status: 403 }
            )
        }

        await dbConnect()
        const body = await request.json()
        const {
            invoiceId,
            progressId,
            inspectionType,
            inspectorId,
            scheduledDate,
            testingRequired,
        } = body

        if (!inspectionType || !inspectorId || !scheduledDate) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Missing required fields' },
                { status: 400 }
            )
        }

        const inspection = await Inspection.create({
            invoiceId,
            progressId,
            inspectionType,
            inspectorId,
            scheduledDate: new Date(scheduledDate),
            testingRequired: !!testingRequired,
            status: InspectionStatus.PENDING,
        })

        // If linked to an invoice, update invoice status
        if (invoiceId) {
            await Invoice.findByIdAndUpdate(invoiceId, { status: InvoiceStatus.INSPECTION_ASSIGNED })
        }

        return NextResponse.json(
            {
                success: true,
                data: inspection,
                message: 'Inspection assigned successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
