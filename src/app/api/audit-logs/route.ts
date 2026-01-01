// Audit Logs API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { AuditLog, User } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const entityType = searchParams.get('entityType')

        const query: any = {}
        if (entityType) query.entityType = entityType

        // Role-based filtering
        const user = await User.findById(payload.userId).select('requestedRole').lean()

        if (user?.requestedRole === 'VENDOR') {
            // Vendors only see their own actions or logs related to their entities
            query.$or = [
                { userId: payload.userId },
                { 'changes.after.bidderId': payload.userId }, // For bid updates
                { 'changes.before.bidderId': payload.userId },
                { 'changes.after.vendorId': payload.userId }, // For machine/invitation updates
                { 'changes.before.vendorId': payload.userId }
            ]
        }
        // PMs and Admins can see all logs for now as per previous implementation

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean()

        return NextResponse.json({
            success: true,
            data: logs
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
