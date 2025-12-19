// Project Members API - Assign members to project
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { ProjectMember, User, MemberRole } from '@/models'

// GET project members
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const members = await ProjectMember.find({ projectId, isActive: true }).lean()

        return NextResponse.json({
            success: true,
            data: members,
            count: members.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST assign members
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
        const { vendors, supervisors, projectManagers } = body

        let added = 0
        const errors: string[] = []

        const addMembers = async (userIds: string[], role: MemberRole) => {
            for (const userId of userIds || []) {
                try {
                    // Get user details
                    const user = await User.findById(userId).select('name email').lean()
                    if (!user) {
                        errors.push(`User ${userId} not found`)
                        continue
                    }

                    // Check if already member
                    const existing = await ProjectMember.findOne({ projectId, userId })
                    if (existing) {
                        if (!existing.isActive) {
                            existing.isActive = true
                            existing.role = role
                            await existing.save()
                            added++
                        }
                        continue
                    }

                    await ProjectMember.create({
                        projectId,
                        userId,
                        userName: user.name,
                        userEmail: user.email,
                        role,
                        addedBy: payload.userId,
                    })
                    added++
                } catch (err: any) {
                    errors.push(`Failed to add ${userId}: ${err.message}`)
                }
            }
        }

        await addMembers(vendors, MemberRole.VENDOR)
        await addMembers(supervisors, MemberRole.SUPERVISOR)
        await addMembers(projectManagers, MemberRole.PROJECT_MANAGER)

        return NextResponse.json({
            success: true,
            data: {
                membersAdded: added,
                errors: errors.length > 0 ? errors : undefined,
            },
            message: `${added} members assigned to project`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
