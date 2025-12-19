// Single Report API - GET, PUT
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { DailyReport } from '@/models'

// GET single report
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reportId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { reportId } = await params

        const report = await DailyReport.findById(reportId).lean()

        if (!report) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Report not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: report })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT update/review report
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ reportId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { reportId } = await params
        const body = await request.json()
        const { status, reviewNotes } = body

        const updateData: any = {}

        if (status) {
            updateData.status = status
            if (status === 'APPROVED' || status === 'REJECTED') {
                updateData.reviewedBy = payload.userId
                updateData.reviewedAt = new Date()
            }
        }

        if (reviewNotes) {
            updateData.reviewNotes = reviewNotes
        }

        const report = await DailyReport.findByIdAndUpdate(reportId, updateData, { new: true }).lean()

        if (!report) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Report not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: report,
            message: 'Report updated successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
