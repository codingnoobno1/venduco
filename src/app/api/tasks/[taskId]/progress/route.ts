// Task Progress Update API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Task } from '@/models'

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ taskId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { taskId } = await context.params

        const body = await request.json()
        const { progress } = body

        if (progress === undefined || progress < 0 || progress > 100) {
            return NextResponse.json(
                { success: false, message: 'Progress must be between 0 and 100' },
                { status: 400 }
            )
        }

        const task = await Task.findByIdAndUpdate(
            taskId,
            {
                progress,
                status: progress >= 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'TODO',
                ...(progress >= 100 && { completedAt: new Date() })
            },
            { new: true }
        )

        if (!task) {
            return NextResponse.json(
                { success: false, message: 'Task not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: task,
            message: `Progress updated to ${progress}%`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
