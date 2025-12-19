export const dynamic = 'force-dynamic';
// My Projects API - Get user's projects
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Project, ProjectMember } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        // Get projects where user is a member OR is the PM
        const memberships = await ProjectMember.find({
            userId: payload.userId,
            isActive: true
        }).lean()

        const memberProjectIds = memberships.map(m => m.projectId)

        const projects = await Project.find({
            $or: [
                { _id: { $in: memberProjectIds } },
                { pmId: payload.userId }
            ]
        }).sort({ updatedAt: -1 }).lean()

        // Enrich with membership role
        const enrichedProjects = projects.map(project => {
            const membership = memberships.find(m => m.projectId === String(project._id))
            return {
                ...project,
                myRole: membership?.role || (project.pmId === payload.userId ? 'PROJECT_MANAGER' : 'MEMBER'),
            }
        })

        return NextResponse.json({
            success: true,
            data: enrichedProjects,
            count: enrichedProjects.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
