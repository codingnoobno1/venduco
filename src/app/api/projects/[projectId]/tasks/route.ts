import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { EngineeringTask, ProjectMember, MemberRole } from '@/models'
import { verifyToken } from '@/lib/auth'

/**
 * @GET Fetch Engineering Tasks for a Project
 * @POST Create a new Engineering Task
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params
    const { searchParams } = new URL(req.url)
    const sectionId = searchParams.get('sectionId')
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    try {
        await dbConnect()
        const query: any = { projectId }
        if (sectionId) query.sectionId = sectionId
        if (department) query.department = department
        if (status) query.status = status

        const tasks = await EngineeringTask.find(query)
            .populate('sectionId', 'name chainageStart chainageEnd')
            .populate('contractId', 'contractCode value')
            .sort({ createdAt: -1 })

        return NextResponse.json({ success: true, data: tasks })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params
    const decoded = verifyToken(req)

    if (!decoded) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    try {
        await dbConnect()

        // Check permission (PM or Supervisor)
        const membership = await ProjectMember.findOne({
            projectId,
            userId: decoded.userId,
            role: { $in: [MemberRole.PROJECT_MANAGER, MemberRole.SUPERVISOR] }
        })

        if (!membership) {
            return NextResponse.json({ success: false, message: 'Only PMs or Supervisors can create tasks' }, { status: 403 })
        }

        const body = await req.json()
        const { sectionId, contractId, department, taskCode, plannedQuantity, unit, plannedStart, plannedEnd, boqItemId } = body

        // Validate basic required fields
        if (!sectionId || !contractId || !department || !taskCode || !plannedQuantity || !unit) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
        }

        const newTask = await EngineeringTask.create({
            projectId,
            sectionId,
            contractId,
            department,
            taskCode,
            plannedQuantity,
            unit,
            plannedStart,
            plannedEnd,
            boqItemId,
            status: 'PLANNED'
        })

        return NextResponse.json({ success: true, data: newTask }, { status: 201 })
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ success: false, message: 'Task code already exists in this section' }, { status: 400 })
        }
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
