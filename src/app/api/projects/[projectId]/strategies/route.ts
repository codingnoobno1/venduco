import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectStrategy, StrategyStatus } from '@/models/ProjectStrategy'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params
        const { searchParams } = new URL(request.url)
        const sectionId = searchParams.get('sectionId')

        const query: any = { projectId }
        if (sectionId) query.sectionId = sectionId

        const strategies = await ProjectStrategy.find(query).sort({ createdAt: -1 }).lean()

        return NextResponse.json({
            success: true,
            data: strategies
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

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
        const { action, strategyId } = body

        // Handle Approval/Rejection (Action-based)
        if (action && strategyId) {
            if (payload.role !== 'PROJECT_MANAGER' && payload.role !== 'ADMIN') {
                return NextResponse.json(
                    { success: false, message: 'Only Project Managers can approve strategies' },
                    { status: 403 }
                )
            }

            const status = action === 'APPROVE' ? StrategyStatus.APPROVED : StrategyStatus.REJECTED
            const strategy = await ProjectStrategy.findByIdAndUpdate(
                strategyId,
                {
                    status,
                    approvedBy: payload.userId,
                    activeFrom: action === 'APPROVE' ? new Date() : undefined
                },
                { new: true }
            )

            return NextResponse.json({
                success: true,
                data: strategy,
                message: `Strategy ${action.toLowerCase()}ed`
            })
        }

        // Handle New Proposal
        const strategy = await ProjectStrategy.create({
            ...body,
            projectId,
            proposedBy: payload.userId,
            status: StrategyStatus.PROPOSED
        })

        return NextResponse.json({
            success: true,
            data: strategy,
            message: 'Strategy proposed successfully'
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
