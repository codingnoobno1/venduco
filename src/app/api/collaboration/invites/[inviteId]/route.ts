// Individual Collaboration Invite API - Accept/decline
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectCollaborator, CollaboratorStatus } from '@/models/ProjectCollaborator'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// PUT accept or decline invite
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ inviteId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { inviteId } = await params
        const body = await request.json()
        const { action, reason } = body

        const invite = await ProjectCollaborator.findById(inviteId)
        if (!invite) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Invite not found' },
                { status: 404 }
            )
        }

        // Only invitee can respond
        if (invite.userId !== payload.userId) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'You cannot respond to this invite' },
                { status: 403 }
            )
        }

        if (invite.status !== CollaboratorStatus.PENDING) {
            return NextResponse.json(
                { success: false, error: 'INVALID', message: 'Invite already responded' },
                { status: 400 }
            )
        }

        if (action === 'ACCEPT') {
            invite.status = CollaboratorStatus.ACCEPTED
            invite.acceptedAt = new Date()
        } else if (action === 'DECLINE') {
            invite.status = CollaboratorStatus.DECLINED
            invite.declineReason = reason
        } else {
            return NextResponse.json(
                { success: false, error: 'INVALID', message: 'Invalid action' },
                { status: 400 }
            )
        }

        await invite.save()

        return NextResponse.json({
            success: true,
            data: {
                projectId: invite.projectId,
                projectName: invite.projectName,
                status: invite.status,
            },
            message: `Invitation ${action.toLowerCase()}ed`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
