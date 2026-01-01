export const dynamic = 'force-dynamic';
// Projects API - List all & Create new
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Project, ProjectStatus, BidInvitation, InvitationStatus, User, Notification, NotificationType, NotificationPriority } from '@/models'

// GET all projects (with filters)
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const pmId = searchParams.get('pmId')

        const query: any = {}
        if (status) query.status = status
        if (pmId) query.pmId = pmId

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: projects,
            count: projects.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new project
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        // Support both 'name' and 'projectName' for compatibility
        const name = body.name || body.projectName
        const projectCode = body.projectCode
        const {
            location, address, description, startDate, endDate, deadline, budget,
            clientName, projectType, planningStatus, minExperience, requiredBrands,
            maintenancePeriod, imageUrl, departments,
            biddingMode, biddingEnabled, biddingStartDate, biddingEndDate, allowedVendorIds
        } = body

        // Validation
        if (!name || !projectCode) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Project name and code are required' },
                { status: 400 }
            )
        }

        // Check duplicate code
        const existing = await Project.findOne({ projectCode: projectCode.toUpperCase() })
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'Project code already exists' },
                { status: 409 }
            )
        }

        const project = await Project.create({
            name,
            projectCode: projectCode.toUpperCase(),
            location: location || 'TBD',
            address,
            description,
            startDate: startDate ? new Date(startDate) : new Date(),
            deadline: deadline || endDate ? new Date(deadline || endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days default
            budget: budget || 0,
            clientName: clientName || 'TBD',
            projectType: projectType || 'CONSTRUCTION',
            planningStatus: planningStatus || 'IDEATION',
            minExperience,
            requiredBrands,
            maintenancePeriod,
            imageUrl,
            departments: departments || [],
            pmId: payload.userId,
            createdBy: payload.userId,
            status: ProjectStatus.PLANNING,
            biddingMode: biddingMode || 'CLOSED',
            biddingEnabled: biddingEnabled || false,
            biddingStartDate: biddingStartDate ? new Date(biddingStartDate) : undefined,
            biddingEndDate: biddingEndDate ? new Date(biddingEndDate) : undefined,
            allowedVendorIds: allowedVendorIds || [],
        })

        // Create Bid Invitations for invited vendors
        if (allowedVendorIds && Array.isArray(allowedVendorIds) && allowedVendorIds.length > 0) {
            try {
                const vendors = await User.find({ _id: { $in: allowedVendorIds } }).select('name email phone').lean()
                const pm = await User.findById(payload.userId).select('name').lean()

                const invitationsData = vendors.map(vendor => ({
                    projectId: project._id,
                    projectName: project.name,
                    projectCode: project.projectCode,
                    vendorId: vendor._id,
                    vendorName: vendor.name,
                    vendorEmail: vendor.email,
                    vendorPhone: vendor.phone,
                    status: InvitationStatus.PENDING,
                    invitedBy: payload.userId,
                    invitedByName: pm?.name || 'Project Manager',
                    invitedAt: new Date(),
                }))

                if (invitationsData.length > 0) {
                    await BidInvitation.insertMany(invitationsData)

                    // Create Notifications for each vendor
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
                console.error('Failed to create invitations:', err)
                // We don't fail the project creation if invitations fail
            }
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    projectId: project._id,
                    projectCode: project.projectCode,
                    status: project.status,
                },
                message: 'Project created successfully',
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
