// Quote Approval API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

const MaterialRequest = mongoose.models.MaterialRequest

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ requestId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        // Only PM can approve
        if (payload.role !== 'PM' && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Only PM can approve quotes' },
                { status: 403 }
            )
        }

        await dbConnect()
        const { requestId } = await context.params

        const body = await request.json()
        const { vendorId } = body

        const materialRequest = await MaterialRequest.findById(requestId)
        if (!materialRequest) {
            return NextResponse.json(
                { success: false, message: 'Material request not found' },
                { status: 404 }
            )
        }

        // Find the selected quote
        const selectedQuote = materialRequest.quotes?.find((q: any) => q.vendorId === vendorId)
        if (!selectedQuote) {
            return NextResponse.json(
                { success: false, message: 'Quote not found' },
                { status: 404 }
            )
        }

        // Update the request
        materialRequest.status = 'APPROVED'
        materialRequest.selectedQuote = selectedQuote
        materialRequest.approvedAt = new Date()
        materialRequest.approvedBy = payload.userId
        await materialRequest.save()

        return NextResponse.json({
            success: true,
            data: materialRequest,
            message: 'Quote approved successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
