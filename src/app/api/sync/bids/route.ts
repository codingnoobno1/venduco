export const dynamic = 'force-static';
// Bid Sync API - Get bid updates since a timestamp
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Bid } from '@/models/Bid'
import { BidInvitation } from '@/models/BidInvitation'
import { Project } from '@/models/Project'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        const since = searchParams.get('since')

        const sinceDate = since ? new Date(since) : new Date(Date.now() - 5 * 60 * 1000)

        const isPM = payload.role === 'PROJECT_MANAGER' || payload.role === 'ADMIN'
        const isVendor = payload.role === 'VENDOR'

        let updates: any[] = []

        if (isPM) {
            // Get bids for projects managed by this PM
            const projects = await Project.find({ pmId: payload.userId }).select('_id').lean()
            const projectIds = projects.map(p => p._id)

            const query: any = {
                projectId: projectId ? projectId : { $in: projectIds },
                updatedAt: { $gt: sinceDate }
            }

            const updatedBids = await Bid.find(query)
                .select('_id projectId projectName bidderId bidderName status updatedAt')
                .lean()

            updates = updatedBids.map(bid => ({
                bidId: bid._id,
                projectId: bid.projectId,
                projectName: bid.projectName,
                type: 'BID_UPDATE',
                data: {
                    bidderName: bid.bidderName,
                    status: bid.status
                },
                timestamp: bid.updatedAt
            }))
        }

        if (isVendor) {
            // Get invitation updates for this vendor
            const invitations = await BidInvitation.find({
                vendorId: payload.userId,
                updatedAt: { $gt: sinceDate }
            }).lean()

            const inviteUpdates = invitations.map(inv => ({
                bidId: inv._id,
                projectId: inv.projectId,
                projectName: inv.projectName,
                type: 'INVITATION_UPDATE',
                data: {
                    status: inv.status,
                    invitedBy: inv.invitedByName
                },
                timestamp: inv.updatedAt
            }))

            // Also get updates to their own bids
            const myBids = await Bid.find({
                bidderId: payload.userId,
                updatedAt: { $gt: sinceDate }
            }).lean()

            const bidUpdates = myBids.map(bid => ({
                bidId: bid._id,
                projectId: bid.projectId,
                projectName: bid.projectName,
                type: 'MY_BID_UPDATE',
                data: { status: bid.status },
                timestamp: bid.updatedAt
            }))

            updates = [...inviteUpdates, ...bidUpdates]
        }

        // Sort by timestamp desc
        updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

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
