export const dynamic = 'force-dynamic';
// Tasks Assigned API for Supervisor
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Task } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const tasks = await Task.find({ assignedTo: payload.userId })
            .sort({ priority: -1, dueDate: 1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: tasks,
            count: tasks.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
