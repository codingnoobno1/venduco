// Single Project API - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Project, BidInvitation, InvitationStatus, InvitationType, User, Notification, NotificationType, NotificationPriority } from '@/models'

// GET single project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const project = await Project.findById(projectId).lean()

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: project })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT update project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params
        const body = await request.json()

        const allowedFields = [
            'name', 'projectCode', 'location', 'address', 'description',
            'startDate', 'endDate', 'budget', 'status', 'progress',
            'biddingMode', 'biddingEnabled', 'biddingStartDate', 'biddingEndDate', 'allowedVendorIds', 'directJoinVendorIds'
        ]

        const updateData: any = {}
        Object.keys(body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = body[key]
            }
        })

        const oldProject = await Project.findById(projectId).select('allowedVendorIds name projectCode').lean()
        const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true }).lean()

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // If vendors were added, create new invitations
        if (updateData.allowedVendorIds && oldProject) {
            const oldVendors = oldProject.allowedVendorIds || []
            const newVendors = updateData.allowedVendorIds.filter((id: string) => !oldVendors.includes(id))

            if (newVendors.length > 0) {
                try {
                    const vendors = await User.find({ _id: { $in: newVendors } }).select('name email phone').lean()
                    const pm = await User.findById(payload.userId).select('name').lean()

                    const invitationsData = vendors.map(vendor => ({
                        projectId: project._id,
                        projectName: project.name,
                        projectCode: project.projectCode,
                        vendorId: vendor._id,
                        vendorName: vendor.name,
                        vendorEmail: vendor.email,
                        vendorPhone: vendor.phone,
                        invitationType: body.directJoinVendorIds?.includes(vendor._id.toString())
                            ? InvitationType.MEMBER
                            : InvitationType.BID,
                        status: InvitationStatus.PENDING,
                        invitedBy: payload.userId,
                        invitedByName: pm?.name || 'Project Manager',
                        invitedAt: new Date(),
                    }))

                    if (invitationsData.length > 0) {
                        await BidInvitation.insertMany(invitationsData, { ordered: false }).catch(err => {
                            // Ignore duplicates if they somehow happen
                            console.error('Some invitations already exist')
                        })

                        // Create Notifications for each new vendor
                        const notificationsData = vendors.map(vendor => ({
                            userId: vendor._id,
                            type: NotificationType.BID_INVITATION,
                            title: 'New Bid Invitation',
                            message: `You have been invited to bid on project: ${project.name}`,
                            priority: NotificationPriority.NORMAL,
                            data: {
                                entityType: 'PROJECT',
                                entityId: project._id,
                                projectCode: project.projectCode,
                                actionUrl: `/dashboard/vendor/bids/invitations`,
                            },
                        }))

                        if (notificationsData.length > 0) {
                            await Notification.insertMany(notificationsData)
                        }
                    }
                } catch (err) {
                    console.error('Failed to create invitations for new vendors:', err)
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: project,
            message: 'Project updated successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const project = await Project.findByIdAndDelete(projectId)

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Project deleted successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
