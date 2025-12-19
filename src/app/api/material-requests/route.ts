export const dynamic = 'force-dynamic';
// Material Requests API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

// Material Request Schema (inline for simplicity)
const MaterialRequestSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectName: String,
    requesterId: { type: String, required: true },
    requesterName: String,
    materialName: { type: String, required: true },
    category: { type: String, default: 'OTHER' },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'PCS' },
    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
    requiredBy: Date,
    notes: String,
    broadcastToAll: { type: Boolean, default: true },
    status: { type: String, enum: ['PENDING', 'QUOTED', 'APPROVED', 'FULFILLED', 'CANCELLED'], default: 'PENDING' },
    quotesReceived: { type: Number, default: 0 },
    quotes: [{
        vendorId: String,
        vendorName: String,
        unitPrice: Number,
        totalPrice: Number,
        deliveryDays: Number,
        notes: String,
        submittedAt: Date,
    }],
    selectedQuote: {
        vendorId: String,
        vendorName: String,
        totalPrice: Number,
    },
}, { timestamps: true })

const MaterialRequest = mongoose.models.MaterialRequest || mongoose.model('MaterialRequest', MaterialRequestSchema)

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const view = searchParams.get('view')

        let query: any = {}

        if (view === 'vendor') {
            // Vendors see all broadcast requests
            query = { broadcastToAll: true, status: { $in: ['PENDING', 'QUOTED'] } }
        } else {
            // PMs see their own requests
            query = { requesterId: payload.userId }
        }

        const requests = await MaterialRequest.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: requests,
            count: requests.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { projectId, projectName, materialName, category, quantity, unit, priority, requiredBy, notes, broadcastToAll } = body

        if (!materialName || !quantity) {
            return NextResponse.json(
                { success: false, message: 'Material name and quantity are required' },
                { status: 400 }
            )
        }

        const materialRequest = await MaterialRequest.create({
            projectId,
            projectName,
            requesterId: payload.userId,
            requesterName: payload.name || 'PM',
            materialName,
            category,
            quantity,
            unit,
            priority,
            requiredBy: requiredBy ? new Date(requiredBy) : undefined,
            notes,
            broadcastToAll: broadcastToAll !== false,
            status: 'PENDING',
        })

        return NextResponse.json({
            success: true,
            data: materialRequest,
            message: 'Material request created and broadcasted to vendors',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
