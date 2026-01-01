
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Contract } from '@/models'

// GET all contracts for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const contracts = await Contract.find({
            projectId,
            status: { $ne: 'TERMINATED' } // Optional: filter out terminated?
        })
            .populate('vendorId', 'name email') // assuming vendorId ref is User or has name
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: contracts,
            count: contracts.length
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
