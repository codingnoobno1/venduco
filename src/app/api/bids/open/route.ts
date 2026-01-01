export const dynamic = 'force-dynamic';
// Open Projects for Bidding API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Project, Bid, ProjectStatus } from '@/models'

// GET projects open for bidding
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const now = new Date()

        // Get projects in PLANNING or ACTIVE status that accept bids
        const projects = await Project.find({
            status: { $in: [ProjectStatus.PLANNING, ProjectStatus.ACTIVE] },
            deletedAt: { $exists: false },
            biddingEnabled: true,
            biddingMode: 'OPEN',
            $and: [
                {
                    $or: [
                        { biddingStartDate: { $exists: false } },
                        { biddingStartDate: { $lte: now } }
                    ]
                },
                {
                    $or: [
                        { biddingEndDate: { $exists: false } },
                        { biddingEndDate: { $gte: now } }
                    ]
                }
            ]
        })
            .select('name projectCode location description budget startDate deadline status createdAt biddingEndDate')
            .sort({ createdAt: -1 })
            .lean()

        // Get user's existing bids
        const userBids = await Bid.find({ bidderId: payload.userId })
            .select('projectId status')
            .lean()

        const bidMap = new Map(userBids.map((b: any) => [b.projectId, b.status]))

        // Enrich projects with bid status
        const enrichedProjects = projects.map(project => ({
            ...project,
            myBidStatus: bidMap.get(String(project._id)) || null,
            canBid: !bidMap.has(String(project._id)),
        }))

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
