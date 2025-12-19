// Unpin Announcement API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

const Announcement = mongoose.models.Announcement

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ projectId: string; announcementId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { announcementId } = await context.params

        await Announcement.findByIdAndUpdate(announcementId, { active: false })

        return NextResponse.json({
            success: true,
            message: 'Announcement unpinned',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
