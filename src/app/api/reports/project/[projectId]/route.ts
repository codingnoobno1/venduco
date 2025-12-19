// Project Reports API - Get reports by project
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { DailyReport, User } from '@/models'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const { searchParams } = new URL(request.url)
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const today = searchParams.get('today') === 'true'
        const status = searchParams.get('status')

        const query: any = { projectId }

        if (today) {
            const startOfDay = new Date()
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)
            query.date = { $gte: startOfDay, $lte: endOfDay }
        } else if (from || to) {
            query.date = {}
            if (from) query.date.$gte = new Date(from)
            if (to) query.date.$lte = new Date(to)
        }

        if (status) query.status = status

        const reports = await DailyReport.find(query)
            .sort({ date: -1, createdAt: -1 })
            .lean()

        // Enrich with submitter names
        const userIds = [...new Set(reports.map(r => r.submittedBy))]
        const users = await User.find({ _id: { $in: userIds } }).select('name').lean()
        const userMap = Object.fromEntries(users.map(u => [String(u._id), u.name]))

        const enrichedReports = reports.map(report => ({
            ...report,
            submittedByName: userMap[report.submittedBy] || 'Unknown',
        }))

        return NextResponse.json({
            success: true,
            data: enrichedReports,
            count: enrichedReports.length,
            summary: {
                submitted: reports.filter(r => r.status === 'SUBMITTED').length,
                approved: reports.filter(r => r.status === 'APPROVED').length,
                rejected: reports.filter(r => r.status === 'REJECTED').length,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
