import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectTeam } from '@/models/ProjectTeam'
import { ProjectMember } from '@/models/ProjectMember'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET project teams
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const teams = await ProjectTeam.find({ projectId, isActive: true }).lean()

        return NextResponse.json({
            success: true,
            data: teams
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

// POST create team
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

        // Verify supervisor is a project member
        const supervisorMember = await ProjectMember.findOne({
            projectId,
            userId: body.supervisorId,
            role: 'SUPERVISOR',
            isActive: true
        })

        if (!supervisorMember) {
            return NextResponse.json(
                { success: false, message: 'Supervisor must be a project member first' },
                { status: 400 }
            )
        }

        const team = await ProjectTeam.create({
            ...body,
            projectId,
            supervisorName: supervisorMember.userName
        })

        return NextResponse.json({
            success: true,
            data: team,
            message: 'Team created successfully'
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
