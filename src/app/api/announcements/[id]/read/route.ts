// Mark Announcement as Read API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Announcement } from '@/models'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params

        const announcement = await Announcement.findByIdAndUpdate(
            id,
            { $addToSet: { readBy: payload.userId } },
            { new: true }
        )

        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Announcement not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Marked as read',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
