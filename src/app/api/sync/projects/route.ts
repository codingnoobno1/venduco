export const dynamic = 'force-dynamic';
// Project Sync API - Get project updates since a timestamp
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Project } from '@/models/Project'
import { ProjectMember } from '@/models/ProjectMember'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        const since = searchParams.get('since')

        const sinceDate = since ? new Date(since) : new Date(Date.now() - 5 * 60 * 1000) // Default: last 5 mins

        // Get projects user has access to
        const memberships = await ProjectMember.find({
            userId: payload.userId,
            isActive: true
        }).select('projectId').lean()

        const projectIds = memberships.map(m => m.projectId)

        // Build query
        const query: any = {
            updatedAt: { $gt: sinceDate },
            $or: [
                { _id: { $in: projectIds } },
                { pmId: payload.userId }
            ]
        }

        if (projectId) {
            query._id = projectId
        }

        const updatedProjects = await Project.find(query)
            .select('_id name projectCode status progress updatedAt')
            .lean()

        // Format updates
        const updates = updatedProjects.map(project => ({
            projectId: project._id,
            projectName: project.name,
            projectCode: project.projectCode,
            type: 'PROJECT_UPDATE',
            data: {
                status: project.status,
                progress: project.progress
            },
            timestamp: project.updatedAt
        }))

        return NextResponse.json({
            success: true,
            updates,
            count: updates.length,
            since: sinceDate.toISOString()
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
