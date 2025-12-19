export const dynamic = 'force-static';
// Announcements API - GET and POST
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Announcement, User, AnnouncementScope, AnnouncementPriority } from '@/models'

// GET announcements
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const scope = searchParams.get('scope')
        const scopeId = searchParams.get('scopeId')

        const query: any = {
            isActive: true,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        }

        if (scope) query.scope = scope
        if (scopeId) query.scopeId = scopeId

        const announcements = await Announcement.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: announcements,
            count: announcements.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create announcement
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { scope, scopeId, title, message, priority, expiresAt } = body

        // Validation
        if (!scope || !title || !message) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Scope, title and message are required' },
                { status: 400 }
            )
        }

        if (!Object.values(AnnouncementScope).includes(scope)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Invalid scope' },
                { status: 400 }
            )
        }

        // Get creator name
        const creator = await User.findById(payload.userId).select('name').lean()

        const announcement = await Announcement.create({
            scope,
            scopeId,
            title,
            message,
            priority: priority || AnnouncementPriority.NORMAL,
            createdBy: payload.userId,
            createdByName: creator?.name || 'Admin',
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        })

        return NextResponse.json(
            {
                success: true,
                data: {
                    announcementId: announcement._id,
                    title: announcement.title,
                },
                message: 'Announcement created',
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
