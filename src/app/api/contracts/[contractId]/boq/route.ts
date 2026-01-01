import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { BOQItem, Contract, ProjectMember, MemberRole } from '@/models'
import { verifyToken } from '@/lib/auth'

/**
 * @GET Fetch BOQ for a Contract
 * @POST Create/Import BOQ items for a Contract
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ contractId: string }> }
) {
    const { contractId } = await params

    try {
        await dbConnect()
        const boq = await BOQItem.find({ contractId }).sort({ taskCode: 1 })
        return NextResponse.json({ success: true, data: boq })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ contractId: string }> }
) {
    const { contractId } = await params
    const decoded = verifyToken(req)

    if (!decoded) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    try {
        await dbConnect()

        const contract = await Contract.findById(contractId)
        if (!contract) {
            return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 })
        }

        // Only PM can set the BOQ baseline
        const membership = await ProjectMember.findOne({
            projectId: contract.projectId,
            userId: decoded.userId,
            role: MemberRole.PROJECT_MANAGER
        })

        if (!membership) {
            return NextResponse.json({ success: false, message: 'Only PMs can define the project BOQ' }, { status: 403 })
        }

        const body = await req.json()
        const { sectionId, taskCode, description, totalQuantity, unit, rate } = body

        if (!sectionId || !taskCode || !totalQuantity || !unit || !rate) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
        }

        const newsItem = await BOQItem.create({
            contractId,
            sectionId,
            taskCode,
            description,
            totalQuantity,
            unit,
            rate,
            totalAmount: totalQuantity * rate
        })

        return NextResponse.json({ success: true, data: newsItem }, { status: 201 })
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ success: false, message: 'BOQ Item with this task code already exists for this section' }, { status: 400 })
        }
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
