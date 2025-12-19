// Project Chat API - GET and POST messages
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { ChatMessage, User } from '@/models'

// GET messages
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
        const limit = parseInt(searchParams.get('limit') || '50')
        const before = searchParams.get('before')

        const query: any = { projectId }
        if (before) {
            query._id = { $lt: before }
        }

        const messages = await ChatMessage.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean()

        return NextResponse.json({
            success: true,
            data: {
                messages: messages.reverse(), // Oldest first
                hasMore: messages.length === limit,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST send message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params
        const body = await request.json()
        const { message, attachments, replyTo } = body

        if (!message?.trim()) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Message is required' },
                { status: 400 }
            )
        }

        // Get sender details
        const sender = await User.findById(payload.userId).select('name requestedRole').lean()

        const chatMessage = await ChatMessage.create({
            projectId,
            senderId: payload.userId,
            senderName: sender?.name || 'Unknown',
            senderRole: sender?.requestedRole || 'USER',
            message: message.trim(),
            attachments,
            replyTo,
            timestamp: new Date(),
        })

        return NextResponse.json(
            {
                success: true,
                data: {
                    messageId: chatMessage._id,
                    timestamp: chatMessage.timestamp,
                },
                message: 'Message sent',
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
