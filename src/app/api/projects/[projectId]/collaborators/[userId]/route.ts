// Individual Collaborator API - Update/remove
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectCollaborator, CollaboratorStatus } from '@/models/ProjectCollaborator'
import { Project } from '@/models/Project'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET single collaborator
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId, userId } = await params

        const collaborator = await ProjectCollaborator.findOne({
            projectId,
            userId
        }).lean()

        if (!collaborator) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Collaborator not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: collaborator })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT update collaborator (permissions, accept/decline)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId, userId } = await params
        const body = await request.json()
        const { action, permissions, declineReason } = body

        const collaborator = await ProjectCollaborator.findOne({ projectId, userId })
        if (!collaborator) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Collaborator not found' },
                { status: 404 }
            )
        }

        const isInvitee = collaborator.userId === payload.userId
        const project = await Project.findById(projectId)
        const isAdminPM = project?.pmId === payload.userId || payload.role === 'ADMIN'

        switch (action) {
            case 'ACCEPT':
                if (!isInvitee) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only invitee can accept' },
                        { status: 403 }
                    )
                }
                collaborator.status = CollaboratorStatus.ACCEPTED
                collaborator.acceptedAt = new Date()
                break

            case 'DECLINE':
                if (!isInvitee) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only invitee can decline' },
                        { status: 403 }
                    )
                }
                collaborator.status = CollaboratorStatus.DECLINED
                collaborator.declineReason = declineReason
                break

            case 'UPDATE_PERMISSIONS':
                if (!isAdminPM) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only admin PM can update permissions' },
                        { status: 403 }
                    )
                }
                if (permissions) {
                    collaborator.permissions = permissions
                }
                break

            case 'REMOVE':
                if (!isAdminPM) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only admin PM can remove collaborators' },
                        { status: 403 }
                    )
                }
                collaborator.status = CollaboratorStatus.REMOVED
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'INVALID', message: 'Invalid action' },
                    { status: 400 }
                )
        }

        await collaborator.save()

        return NextResponse.json({
            success: true,
            data: { status: collaborator.status },
            message: `Collaborator ${action.toLowerCase()} successful`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE collaborator
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId, userId } = await params

        const project = await Project.findById(projectId)
        if (project?.pmId !== payload.userId && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only admin PM can delete' },
                { status: 403 }
            )
        }

        await ProjectCollaborator.findOneAndDelete({ projectId, userId })

        return NextResponse.json({
            success: true,
            message: 'Collaborator removed successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
