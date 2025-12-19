// Mark Notification as Read API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Notification } from '@/models'

// PUT mark as read
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params

        await Notification.findOneAndUpdate(
            { _id: id, userId: payload.userId },
            { isRead: true, readAt: new Date() }
        )

        return NextResponse.json({
            success: true,
            message: 'Notification marked as read',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
