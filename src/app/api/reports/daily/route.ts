export const dynamic = 'force-dynamic';
// Daily Reports API - Create new report
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { DailyReport, ReportStatus } from '@/models'

export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { projectId, machineId, machineCode, date, workDone, hoursUsed,
            materialsUsed, manpower, issues, photos } = body

        // Validation
        if (!projectId || !workDone || hoursUsed === undefined) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Project, work done, and hours are required' },
                { status: 400 }
            )
        }

        const report = await DailyReport.create({
            projectId,
            machineId,
            machineCode,
            date: date ? new Date(date) : new Date(),
            workDone,
            hoursUsed,
            materialsUsed,
            manpower,
            issues,
            photos,
            submittedBy: payload.userId,
            submittedAt: new Date(),
            status: ReportStatus.SUBMITTED,
        })

        return NextResponse.json(
            {
                success: true,
                data: {
                    reportId: report._id,
                    status: report.status,
                    date: report.date,
                },
                message: 'Report submitted successfully',
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
