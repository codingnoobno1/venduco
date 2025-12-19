// Issue to Task Conversion API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Task } from '@/models'
import mongoose from 'mongoose'

const Issue = mongoose.models.Issue

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ issueId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { issueId } = await context.params

        const body = await request.json()
        const { assignTo, dueDate, priority } = body

        // Get the issue
        const issue = await Issue.findById(issueId).lean()
        if (!issue) {
            return NextResponse.json(
                { success: false, message: 'Issue not found' },
                { status: 404 }
            )
        }

        // Create task from issue
        const task = await Task.create({
            projectId: (issue as any).projectId,
            title: `Fix: ${(issue as any).title}`,
            description: (issue as any).description,
            assignedTo: assignTo || payload.userId,
            createdBy: payload.userId,
            priority: priority || (issue as any).priority || 'NORMAL',
            status: 'TODO',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            progress: 0,
            linkedIssueId: issueId,
        })

        // Update issue with linked task
        await Issue.findByIdAndUpdate(issueId, {
            relatedTaskId: task._id,
            status: 'IN_PROGRESS',
        })

        return NextResponse.json({
            success: true,
            data: { task, issueId },
            message: 'Task created from issue',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
