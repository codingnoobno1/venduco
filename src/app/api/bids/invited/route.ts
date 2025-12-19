export const dynamic = 'force-dynamic';
// Invited Bids API - Get my bid invitations
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { BidInvitation, InvitationStatus } from '@/models/BidInvitation'
import { Project } from '@/models/Project'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET my bid invitations
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const query: any = { vendorId: payload.userId }

        if (status === 'pending') {
            query.status = InvitationStatus.PENDING
        } else if (status === 'accepted') {
            query.status = InvitationStatus.ACCEPTED
        } else if (status === 'all') {
            // No filter
        } else {
            // Default: pending only
            query.status = InvitationStatus.PENDING
        }

        const invitations = await BidInvitation.find(query)
            .sort({ invitedAt: -1 })
            .lean()

        // Enrich with project details
        const projectIds = [...new Set(invitations.map(i => i.projectId))]
        const projects = await Project.find({ _id: { $in: projectIds } })
            .select('name projectCode budget deadline biddingEndDate location')
            .lean()

        const projectMap = new Map(projects.map(p => [String(p._id), p]))

        const enrichedInvitations = invitations.map(inv => ({
            ...inv,
            project: projectMap.get(inv.projectId),
        }))

        const pendingCount = invitations.filter(i => i.status === InvitationStatus.PENDING).length

        return NextResponse.json({
            success: true,
            data: enrichedInvitations,
            counts: {
                pending: pendingCount,
                total: invitations.length,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
