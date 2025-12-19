// Bid Actions API - Approve/Reject/Withdraw
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Bid, BidStatus, User, Notification, NotificationType, ProjectMember, MemberRole } from '@/models'

// GET single bid
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bidId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { bidId } = await params

        const bid = await Bid.findById(bidId).lean()

        if (!bid) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Bid not found' },
                { status: 404 }
            )
        }

        // Check access - bidder or PM/Admin
        const user = await User.findById(payload.userId).select('requestedRole').lean()
        const isPMOrAdmin = user?.requestedRole === 'PROJECT_MANAGER' || user?.requestedRole === 'ADMIN'
        const isOwner = bid.bidderId === payload.userId

        if (!isPMOrAdmin && !isOwner) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Access denied' },
                { status: 403 }
            )
        }

        // Mask contact if not approved and not owner
        if (!isOwner && bid.status !== BidStatus.APPROVED && !bid.contactVisible) {
            bid.bidderEmail = '***@***.com'
            bid.bidderPhone = '**********'
        }

        return NextResponse.json({ success: true, data: bid })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT - Approve/Reject/Withdraw bid
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ bidId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { bidId } = await params
        const body = await request.json()
        const { action, reviewNotes, rejectionReason } = body

        const bid = await Bid.findById(bidId)
        if (!bid) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Bid not found' },
                { status: 404 }
            )
        }

        // Check permissions
        const user = await User.findById(payload.userId).select('requestedRole name').lean()
        const isPMOrAdmin = user?.requestedRole === 'PROJECT_MANAGER' || user?.requestedRole === 'ADMIN'
        const isOwner = bid.bidderId === payload.userId

        let updateData: any = {}
        let notificationData: any = null

        switch (action) {
            case 'APPROVE':
                if (!isPMOrAdmin) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only PM/Admin can approve bids' },
                        { status: 403 }
                    )
                }
                updateData = {
                    status: BidStatus.APPROVED,
                    reviewedBy: payload.userId,
                    reviewedAt: new Date(),
                    reviewNotes,
                    contactVisible: true, // Reveal contact info on approval
                }

                // Auto-add bidder as project member
                try {
                    const bidderUser = await User.findById(bid.bidderId).select('name email requestedRole').lean()
                    const memberRole = bid.bidderType === 'SUPERVISOR' ? MemberRole.SUPERVISOR : MemberRole.VENDOR

                    await ProjectMember.findOneAndUpdate(
                        { projectId: bid.projectId, userId: bid.bidderId },
                        {
                            projectId: bid.projectId,
                            userId: bid.bidderId,
                            userName: bidderUser?.name || bid.bidderName,
                            userEmail: bidderUser?.email || bid.bidderEmail,
                            role: memberRole,
                            addedBy: payload.userId,
                            isActive: true,
                        },
                        { upsert: true }
                    )
                } catch (err) {
                    console.error('Failed to add as project member:', err)
                }

                notificationData = {
                    userId: bid.bidderId,
                    type: NotificationType.TASK_COMPLETED,
                    title: '🎉 Bid Approved!',
                    message: `Your bid for ${bid.projectName} has been approved. You are now part of the project team.`,
                    priority: 'HIGH',
                    data: { entityType: 'BID', entityId: bidId, projectId: bid.projectId },
                }
                break

            case 'REJECT':
                if (!isPMOrAdmin) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only PM/Admin can reject bids' },
                        { status: 403 }
                    )
                }
                updateData = {
                    status: BidStatus.REJECTED,
                    reviewedBy: payload.userId,
                    reviewedAt: new Date(),
                    reviewNotes,
                    rejectionReason: rejectionReason || 'Bid not selected',
                    contactVisible: false,
                }

                notificationData = {
                    userId: bid.bidderId,
                    type: NotificationType.REPORT_REJECTED,
                    title: 'Bid Not Selected',
                    message: `Your bid for ${bid.projectName} was not selected. ${rejectionReason || ''}`,
                    priority: 'NORMAL',
                    data: { entityType: 'BID', entityId: bidId, projectId: bid.projectId },
                }
                break

            case 'WITHDRAW':
                if (!isOwner) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only bidder can withdraw' },
                        { status: 403 }
                    )
                }
                if (bid.status === BidStatus.APPROVED) {
                    return NextResponse.json(
                        { success: false, error: 'INVALID', message: 'Cannot withdraw approved bid' },
                        { status: 400 }
                    )
                }
                updateData = {
                    status: BidStatus.WITHDRAWN,
                }
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'INVALID_ACTION', message: 'Invalid action' },
                    { status: 400 }
                )
        }

        const updatedBid = await Bid.findByIdAndUpdate(bidId, updateData, { new: true }).lean()

        // Send notification
        if (notificationData) {
            await Notification.create(notificationData)
        }

        return NextResponse.json({
            success: true,
            data: updatedBid,
            message: `Bid ${action.toLowerCase()}ed successfully`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
