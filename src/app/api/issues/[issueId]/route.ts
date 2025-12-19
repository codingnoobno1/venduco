// Issue Update API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

const Issue = mongoose.models.Issue

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ issueId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { issueId } = await context.params

        const body = await request.json()
        const { status, assignedTo, assignedToName, resolution } = body

        const updateData: any = {}
        if (status) updateData.status = status
        if (assignedTo) updateData.assignedTo = assignedTo
        if (assignedToName) updateData.assignedToName = assignedToName
        if (resolution) updateData.resolution = resolution
        if (status === 'RESOLVED') updateData.resolvedAt = new Date()

        const issue = await Issue.findByIdAndUpdate(issueId, updateData, { new: true })

        if (!issue) {
            return NextResponse.json(
                { success: false, message: 'Issue not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: issue,
            message: 'Issue updated',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
