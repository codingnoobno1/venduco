// Project Bids API - Submit and list bids
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Bid, BidStatus, BidderType, Project, User, Notification, NotificationType } from '@/models'

// GET all bids for a project (PM/Admin sees all, bidder sees own)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        // Get user role
        const user = await User.findById(payload.userId).select('requestedRole').lean()
        const isPMOrAdmin = user?.requestedRole === 'PROJECT_MANAGER' || user?.requestedRole === 'ADMIN'

        let bids
        if (isPMOrAdmin) {
            // PM/Admin sees all bids with full contact info for approved bids
            bids = await Bid.find({ projectId }).sort({ submittedAt: -1 }).lean()

            // Mask contact info for non-approved bids
            bids = bids.map((bid: any) => ({
                ...bid,
                bidderEmail: bid.status === BidStatus.APPROVED || bid.contactVisible
                    ? bid.bidderEmail
                    : '***@***.com',
                bidderPhone: bid.status === BidStatus.APPROVED || bid.contactVisible
                    ? bid.bidderPhone
                    : '**********',
            }))
        } else {
            // Bidders only see their own bids
            bids = await Bid.find({ projectId, bidderId: payload.userId }).lean()
        }

        return NextResponse.json({
            success: true,
            data: bids,
            count: bids.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST submit a new bid
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

        // Get project
        const project = await Project.findById(projectId).select('name pmId status').lean()
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // Get bidder info
        const bidder = await User.findById(payload.userId)
            .select('name email phone requestedRole businessName')
            .lean()

        if (!bidder) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        // Check if already bid
        const existingBid = await Bid.findOne({ projectId, bidderId: payload.userId })
        if (existingBid) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'You have already submitted a bid for this project' },
                { status: 409 }
            )
        }

        // Determine bidder type
        let bidderType = BidderType.VENDOR
        if (bidder.requestedRole === 'SUPERVISOR') bidderType = BidderType.SUPERVISOR
        if (bidder.requestedRole === 'COMPANY_REP') bidderType = BidderType.COMPANY

        const { proposedAmount, timeline, machinesOffered, manpowerOffered, proposal,
            attachments, relevantExperience, pastProjects, certifications } = body

        // Validation
        if (!proposedAmount) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Proposed amount is required' },
                { status: 400 }
            )
        }

        // Create bid
        const bid = await Bid.create({
            projectId,
            projectName: project.name,
            bidderId: payload.userId,
            bidderType,
            bidderName: bidder.name,
            bidderEmail: bidder.email,
            bidderPhone: bidder.phone,
            companyName: bidder.businessName,
            proposedAmount,
            timeline,
            machinesOffered,
            manpowerOffered,
            proposal,
            attachments,
            relevantExperience,
            pastProjects,
            certifications,
            status: BidStatus.SUBMITTED,
            submittedAt: new Date(),
            contactVisible: false, // Hidden until approved
        })

        // Notify PM
        if (project.pmId) {
            await Notification.create({
                userId: project.pmId,
                type: NotificationType.TASK_ASSIGNED, // Reusing type for bid
                title: 'New Bid Received',
                message: `${bidder.name} submitted a bid for ${project.name}`,
                priority: 'NORMAL',
                data: {
                    entityType: 'BID',
                    entityId: String(bid._id),
                    projectId,
                },
            })
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    bidId: bid._id,
                    status: bid.status,
                    projectName: bid.projectName,
                },
                message: 'Bid submitted successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
