// Individual Invitation API - Accept/decline/cancel
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { BidInvitation, InvitationStatus } from '@/models/BidInvitation'
import { Project } from '@/models/Project'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET single invitation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string; inviteId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { inviteId } = await params

        const invitation = await BidInvitation.findById(inviteId).lean()
        if (!invitation) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Invitation not found' },
                { status: 404 }
            )
        }

        // Only PM or invited vendor can view
        const isVendor = invitation.vendorId === payload.userId
        const isPM = payload.role === 'PROJECT_MANAGER' || payload.role === 'ADMIN'

        if (!isVendor && !isPM) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Access denied' },
                { status: 403 }
            )
        }

        return NextResponse.json({ success: true, data: invitation })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT update invitation (accept/decline/cancel)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string; inviteId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId, inviteId } = await params
        const body = await request.json()
        const { action, responseNotes } = body

        const invitation = await BidInvitation.findById(inviteId)
        if (!invitation) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Invitation not found' },
                { status: 404 }
            )
        }

        const isVendor = invitation.vendorId === payload.userId
        const project = await Project.findById(projectId)
        const isPM = project?.pmId === payload.userId || payload.role === 'ADMIN'

        switch (action) {
            case 'ACCEPT':
                if (!isVendor) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only the vendor can accept' },
                        { status: 403 }
                    )
                }
                invitation.status = InvitationStatus.ACCEPTED
                invitation.respondedAt = new Date()
                invitation.responseNotes = responseNotes
                break

            case 'DECLINE':
                if (!isVendor) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only the vendor can decline' },
                        { status: 403 }
                    )
                }
                invitation.status = InvitationStatus.DECLINED
                invitation.respondedAt = new Date()
                invitation.responseNotes = responseNotes
                break

            case 'CANCEL':
                if (!isPM) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only PM can cancel' },
                        { status: 403 }
                    )
                }
                invitation.status = InvitationStatus.CANCELLED
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'INVALID', message: 'Invalid action' },
                    { status: 400 }
                )
        }

        await invitation.save()

        return NextResponse.json({
            success: true,
            data: { status: invitation.status },
            message: `Invitation ${action.toLowerCase()}ed successfully`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE invitation
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string; inviteId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId, inviteId } = await params

        const project = await Project.findById(projectId)
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        if (project.pmId !== payload.userId && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only PM can delete invitations' },
                { status: 403 }
            )
        }

        const invitation = await BidInvitation.findByIdAndDelete(inviteId)
        if (!invitation) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Invitation not found' },
                { status: 404 }
            )
        }

        // Remove from allowed vendors
        if (project.allowedVendorIds?.includes(invitation.vendorId)) {
            project.allowedVendorIds = project.allowedVendorIds.filter(
                (id: string) => id !== invitation.vendorId
            )
            await project.save()
        }

        return NextResponse.json({
            success: true,
            message: 'Invitation deleted successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
