export const dynamic = 'force-dynamic';
// API Route: Get all tasks for a project
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Task } from '@/models'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        const status = searchParams.get('status')
        const assignedToId = searchParams.get('assignedToId')

        // Build query
        const query: any = { deletedAt: null }
        if (projectId) query.projectId = projectId
        if (status) query.status = status
        if (assignedToId) query.assignedToId = assignedToId

        const tasks = await Task.find(query)
            .sort({ deadline: 1, priority: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: tasks,
            count: tasks.length,
        })
    } catch (error: any) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch tasks',
                message: error.message,
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        const body = await request.json()
        const {
            projectId,
            title,
            description,
            priority,
            assignedToId,
            deadline,
            createdById,
        } = body

        // Validation
        if (!projectId || !title || !createdById) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields (projectId, title, createdById)',
                },
                { status: 400 }
            )
        }

        const task = await Task.create({
            projectId,
            title,
            description,
            priority,
            assignedToId,
            deadline: deadline ? new Date(deadline) : undefined,
            createdById,
        })

        return NextResponse.json(
            {
                success: true,
                data: task,
                message: 'Task created successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error creating task:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create task',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
