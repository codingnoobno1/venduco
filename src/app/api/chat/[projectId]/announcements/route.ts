// Announcements API - Pin/Unpin announcements using proper model
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Announcement } from '@/models/Announcement'
import mongoose from 'mongoose'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await context.params

        const now = new Date()
        const announcements = await Announcement.find({
            scope: 'PROJECT',
            scopeId: projectId,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        }).sort({ createdAt: -1 }).lean()

        // Map to expected frontend format
        const data = announcements.map((a: any) => ({
            _id: a._id,
            text: a.message,
            pinnedBy: a.createdBy,
            pinnedByName: a.createdByName,
            expiresAt: a.expiresAt,
            createdAt: a.createdAt,
        }))

        return NextResponse.json({
            success: true,
            data,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await context.params

        const body = await request.json()
        const { text, expiresAt } = body

        if (!text?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Announcement text is required' },
                { status: 400 }
            )
        }

        const announcement = await Announcement.create({
            scope: 'PROJECT',
            scopeId: projectId,
            title: 'Announcement',
            message: text.trim(),
            priority: 'NORMAL',
            createdBy: payload.userId,
            createdByName: payload.name || 'PM',
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            isActive: true,
        })

        return NextResponse.json({
            success: true,
            data: {
                _id: announcement._id,
                text: announcement.message,
                pinnedByName: announcement.createdByName,
                expiresAt: announcement.expiresAt,
            },
            message: 'Announcement pinned',
        }, { status: 201 })
    } catch (error: any) {
        console.error('Announcement POST error:', error)
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
