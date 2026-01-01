import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { CostAlert } from '@/models/CostAlert'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET active alerts
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const alerts = await CostAlert.find({
            projectId,
            isActive: true
        }).sort({ severity: -1, triggeredAt: -1 }).lean()

        return NextResponse.json({
            success: true,
            data: alerts
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

// PUT acknowledge alert
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { alertId } = await request.json()

        const alert = await CostAlert.findByIdAndUpdate(
            alertId,
            {
                isAcknowledged: true,
                acknowledgedBy: payload.userId,
                acknowledgedAt: new Date()
            },
            { new: true }
        )

        return NextResponse.json({
            success: true,
            data: alert,
            message: 'Alert acknowledged'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
