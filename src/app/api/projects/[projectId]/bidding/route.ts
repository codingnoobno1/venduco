// Bidding Control API - GET/PUT bidding settings
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Project, BiddingMode } from '@/models/Project'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET bidding settings for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const project = await Project.findById(projectId)
            .select('name projectCode biddingMode biddingEnabled biddingStartDate biddingEndDate allowedVendorIds pmId')
            .lean()

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // Check if user is PM or admin of this project
        const isProjectPM = project.pmId === payload.userId
        const isPM = payload.role === 'PROJECT_MANAGER' || payload.role === 'ADMIN'

        if (!isProjectPM && !isPM) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only project PM can view bidding settings' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                projectId: project._id,
                projectName: project.name,
                projectCode: project.projectCode,
                biddingMode: project.biddingMode || BiddingMode.CLOSED,
                biddingEnabled: project.biddingEnabled || false,
                biddingStartDate: project.biddingStartDate,
                biddingEndDate: project.biddingEndDate,
                allowedVendorCount: project.allowedVendorIds?.length || 0,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT update bidding settings
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

        const project = await Project.findById(projectId)
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // Check if user is PM of this project
        const isProjectPM = project.pmId === payload.userId
        const isAdmin = payload.role === 'ADMIN'

        if (!isProjectPM && !isAdmin) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only project PM can update bidding settings' },
                { status: 403 }
            )
        }

        const { biddingMode, biddingEnabled, biddingStartDate, biddingEndDate } = body

        // Update bidding settings
        if (biddingMode !== undefined) {
            if (!Object.values(BiddingMode).includes(biddingMode)) {
                return NextResponse.json(
                    { success: false, error: 'INVALID', message: 'Invalid bidding mode' },
                    { status: 400 }
                )
            }
            project.biddingMode = biddingMode
        }

        if (biddingEnabled !== undefined) {
            project.biddingEnabled = biddingEnabled
        }

        if (biddingStartDate !== undefined) {
            project.biddingStartDate = biddingStartDate ? new Date(biddingStartDate) : undefined
        }

        if (biddingEndDate !== undefined) {
            project.biddingEndDate = biddingEndDate ? new Date(biddingEndDate) : undefined
        }

        await project.save()

        return NextResponse.json({
            success: true,
            data: {
                biddingMode: project.biddingMode,
                biddingEnabled: project.biddingEnabled,
                biddingStartDate: project.biddingStartDate,
                biddingEndDate: project.biddingEndDate,
            },
            message: 'Bidding settings updated successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
