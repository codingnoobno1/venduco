export const dynamic = 'force-static';
// In-App Notifications API - Gap 4 Fix
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

// Notification Model
const NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['ISSUE_RAISED', 'ISSUE_RESOLVED', 'MATERIAL_QUOTED', 'MATERIAL_APPROVED',
            'ATTENDANCE_SUBMITTED', 'DAY_LOCKED', 'MENTION', 'ANNOUNCEMENT',
            'TASK_ASSIGNED', 'BID_RECEIVED', 'RENTAL_REQUEST', 'GENERAL'],
        default: 'GENERAL'
    },
    title: String,
    message: { type: String, required: true },
    link: String, // Optional link to related page
    read: { type: Boolean, default: false },
    readAt: Date,
    metadata: mongoose.Schema.Types.Mixed, // For extra data like projectId, issueId, etc.
}, { timestamps: true })

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)

// Helper to create notification
export async function createNotification(data: {
    userId: string,
    type: string,
    title?: string,
    message: string,
    link?: string,
    metadata?: any
}) {
    await dbConnect()
    return Notification.create(data)
}

// GET notifications for user
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get('unread') === 'true'
        const limit = parseInt(searchParams.get('limit') || '20')

        const query: any = { userId: payload.userId }
        if (unreadOnly) {
            query.read = false
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()

        const unreadCount = await Notification.countDocuments({
            userId: payload.userId,
            read: false,
        })

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { notificationId, markAllRead } = body

        if (markAllRead) {
            await Notification.updateMany(
                { userId: payload.userId, read: false },
                { read: true, readAt: new Date() }
            )
        } else if (notificationId) {
            await Notification.findByIdAndUpdate(notificationId, {
                read: true,
                readAt: new Date(),
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Notifications marked as read',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
