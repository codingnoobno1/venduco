// Single Announcement API - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Announcement } from '@/models'

// GET single announcement
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params

        const announcement = await Announcement.findById(id).lean()

        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Announcement not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: announcement })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT update announcement
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params
        const body = await request.json()

        const allowedFields = ['title', 'message', 'priority', 'expiresAt', 'isActive']
        const updateData: any = {}

        Object.keys(body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = body[key]
            }
        })

        const announcement = await Announcement.findByIdAndUpdate(id, updateData, { new: true }).lean()

        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Announcement not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: announcement,
            message: 'Announcement updated',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE announcement
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params

        const announcement = await Announcement.findByIdAndUpdate(id, { isActive: false }, { new: true })

        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Announcement not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Announcement deleted',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
