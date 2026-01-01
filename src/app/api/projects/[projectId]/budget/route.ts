import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectBudget } from '@/models/ProjectBudget'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET project budget
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const budget = await ProjectBudget.findOne({ projectId }).lean()

        return NextResponse.json({
            success: true,
            data: budget
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

// POST/PUT budget allocation
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        // Only PM can set budget
        if (payload.role !== 'PROJECT_MANAGER' && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Only Project Managers can set budget' },
                { status: 403 }
            )
        }

        await dbConnect()
        const { projectId } = await params
        const body = await request.json()

        const budget = await ProjectBudget.findOneAndUpdate(
            { projectId },
            {
                $set: {
                    ...body,
                    approvedBy: payload.userId,
                    lastRevisionDate: new Date(),
                    $inc: { revisionNumber: 1 }
                }
            },
            { upsert: true, new: true, runValidators: true }
        )

        return NextResponse.json({
            success: true,
            data: budget,
            message: 'Budget allocated successfully'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
