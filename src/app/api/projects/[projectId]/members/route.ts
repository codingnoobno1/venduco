// Full Project Membership API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { ProjectMember } from '@/models/ProjectMember'
import { Project } from '@/models/Project'

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
        const role = searchParams.get('role')

        const project = await Project.findById(projectId).select('pmId').lean()
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // Query members
        const query: any = { projectId, isActive: true }
        if (role) query.role = role

        const members = await ProjectMember.find(query)
            .sort({ addedAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: members,
            count: members.length
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
