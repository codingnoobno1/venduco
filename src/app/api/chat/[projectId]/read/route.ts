// Read Receipts API - Mark messages as read
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { ChatMessage } from '@/models'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await context.params

        // Mark all unread messages in this project as read by this user
        await ChatMessage.updateMany(
            {
                projectId,
                senderId: { $ne: payload.userId },
                readBy: { $ne: payload.userId }
            },
            {
                $addToSet: { readBy: payload.userId },
                $set: { lastReadAt: new Date() }
            }
        )

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
