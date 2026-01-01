import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { CollaborationUnit } from '@/models/CollaborationUnit'
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

        const units = await CollaborationUnit.find({ projectId }).sort({ unitType: 1 }).lean()

        return NextResponse.json({
            success: true,
            data: units
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

        // Only PM or ADMIN can manage collaboration units
        if (payload.role !== 'PROJECT_MANAGER' && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Only Project Managers can manage collaboration units' },
                { status: 403 }
            )
        }

        await dbConnect()
        const { projectId } = await params
        const body = await request.json()

        const unit = await CollaborationUnit.create({
            ...body,
            projectId
        })

        return NextResponse.json({
            success: true,
            data: unit,
            message: 'Collaboration unit created successfully'
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
