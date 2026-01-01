// Bidding Invitations API - List and create vendor invitations
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Project } from '@/models/Project'
import { BidInvitation, InvitationStatus, InvitationType } from '@/models/BidInvitation'
import { User } from '@/models/User'
import { MemberRole } from '@/models/ProjectMember'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET list all invitations for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const project = await Project.findById(projectId).select('pmId name').lean()
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // Only PM can view invitations
        if (project.pmId !== payload.userId && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Access denied' },
                { status: 403 }
            )
        }

        const invitations = await BidInvitation.find({ projectId })
            .sort({ invitedAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: invitations,
            count: invitations.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new invitation
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
        const { vendorId, message, expiresAt, invitationType, targetRole } = body

        if (!vendorId) {
            return NextResponse.json(
                { success: false, error: 'INVALID', message: 'Vendor ID is required' },
                { status: 400 }
            )
        }

        const project = await Project.findById(projectId)
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // Only PM can invite vendors
        if (project.pmId !== payload.userId && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only project PM can invite vendors' },
                { status: 403 }
            )
        }

        // Get vendor details
        const vendor = await User.findById(vendorId).select('name email phone requestedRole').lean()
        if (!vendor) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Vendor not found' },
                { status: 404 }
            )
        }

        // For BID, must be vendor. For MEMBER, can be anything except ADMIN
        if ((invitationType === InvitationType.BID || !invitationType) && vendor.requestedRole !== 'VENDOR') {
            return NextResponse.json(
                { success: false, error: 'INVALID', message: 'User is not a vendor' },
                { status: 400 }
            )
        }

        // Check for existing invitation
        const existing = await BidInvitation.findOne({ projectId, vendorId })
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'Vendor already invited' },
                { status: 400 }
            )
        }

        // Get inviter details
        const inviter = await User.findById(payload.userId).select('name').lean()

        const invitation = await BidInvitation.create({
            projectId,
            projectName: project.name,
            projectCode: project.projectCode,
            vendorId,
            vendorName: vendor.name,
            vendorEmail: vendor.email,
            vendorPhone: vendor.phone,
            invitedBy: payload.userId,
            invitedByName: inviter?.name || 'Unknown',
            message,
            invitationType: invitationType || InvitationType.BID,
            targetRole: targetRole || MemberRole.VENDOR,
            status: InvitationStatus.PENDING,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        })

        // Add vendor to allowed list if invite-only mode
        if (!project.allowedVendorIds?.includes(vendorId)) {
            project.allowedVendorIds = [...(project.allowedVendorIds || []), vendorId]
            await project.save()
        }

        return NextResponse.json({
            success: true,
            data: {
                invitationId: invitation._id,
                vendorName: vendor.name,
                status: invitation.status,
            },
            message: 'Vendor invited successfully',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
