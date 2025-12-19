// Material Request Quote API
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

        await dbConnect()
        const { requestId } = await context.params

        const body = await request.json()
        const { unitPrice, totalPrice, deliveryDays, notes } = body

        if (!unitPrice) {
            return NextResponse.json(
                { success: false, message: 'Unit price is required' },
                { status: 400 }
            )
        }

        // Add quote to the request
        const materialRequest = await MaterialRequest.findByIdAndUpdate(
            requestId,
            {
                $push: {
                    quotes: {
                        vendorId: payload.userId,
                        vendorName: payload.name || 'Vendor',
                        unitPrice,
                        totalPrice,
                        deliveryDays,
                        notes,
                        submittedAt: new Date(),
                    }
                },
                $inc: { quotesReceived: 1 },
                $set: { status: 'QUOTED' }
            },
            { new: true }
        )

        if (!materialRequest) {
            return NextResponse.json(
                { success: false, message: 'Request not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Quote submitted successfully',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
