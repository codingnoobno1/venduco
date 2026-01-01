import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Invoice, InvoiceType, InvoiceStatus, Contract, User, UserRole } from '@/models'

// GET invoices
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        const vendorId = searchParams.get('vendorId')
        const status = searchParams.get('status')

        const query: any = {}
        if (projectId) query.projectId = projectId
        if (vendorId) query.vendorId = vendorId
        if (status) query.status = status

        // If user is a vendor, they can only see their own invoices
        const user = await User.findById(payload.userId).select('requestedRole').lean()
        if (user?.requestedRole === UserRole.VENDOR) {
            query.vendorId = payload.userId
        }

        const invoices = await Invoice.find(query)
            .sort({ createdAt: -1 })
            .populate('projectId', 'name')
            .populate('vendorId', 'name businessName')
            .lean()

        return NextResponse.json({
            success: true,
            data: invoices,
            count: invoices.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new invoice
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const body = await request.json()
        const {
            projectId,
            contractId,
            sectionId,
            invoiceType,
            invoiceNumber,
            amount,
            periodFrom,
            periodTo,
            linkedProgressIds,
            linkedMachineRentalIds,
            linkedDeliveryIds,
            description,
            attachmentUrls,
        } = body

        // 1. Validation
        if (!projectId || !contractId || !invoiceType || !invoiceNumber || !amount || !periodFrom || !periodTo) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // 2. Enforce Type-Specific Evidence
        if (invoiceType === InvoiceType.LABOUR && (!linkedProgressIds || linkedProgressIds.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Labour invoices must be linked to progress logs' },
                { status: 400 }
            )
        }

        if (invoiceType === InvoiceType.MACHINE && (!linkedMachineRentalIds || linkedMachineRentalIds.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Machine invoices must be linked to rental records' },
                { status: 400 }
            )
        }

        if (invoiceType === InvoiceType.MATERIAL && (!linkedDeliveryIds || linkedDeliveryIds.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Material invoices must be linked to delivery challans' },
                { status: 400 }
            )
        }

        // 3. Create Invoice
        const invoice = await Invoice.create({
            projectId,
            contractId,
            vendorId: payload.userId,
            sectionId,
            invoiceType,
            invoiceNumber,
            amount,
            periodFrom: new Date(periodFrom),
            periodTo: new Date(periodTo),
            status: InvoiceStatus.SUBMITTED,
            linkedProgressIds,
            linkedMachineRentalIds,
            linkedDeliveryIds,
            description,
            attachmentUrls,
            submittedAt: new Date(),
        })

        return NextResponse.json(
            {
                success: true,
                data: invoice,
                message: 'Invoice submitted successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        if ((error as any).code === 11000) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'Invoice number already exists' },
                { status: 409 }
            )
        }
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
