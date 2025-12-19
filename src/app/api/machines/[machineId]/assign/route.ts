// Machine Assignment API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Machine, MachineAssignment, MachineStatus } from '@/models'

// POST assign machine to project/person
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ machineId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { machineId } = await params
        const body = await request.json()
        const { projectId, assignedToUserId, from, to, notes } = body

        // Validation
        if (!projectId || !assignedToUserId || !from || !to) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Project, assignee, and dates are required' },
                { status: 400 }
            )
        }

        // Get machine
        const machine = await Machine.findById(machineId)
        if (!machine) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Machine not found' },
                { status: 404 }
            )
        }

        // Check if already assigned in date range
        const conflict = await MachineAssignment.findOne({
            machineId,
            status: 'ACTIVE',
            $or: [
                { fromDate: { $lte: new Date(to) }, toDate: { $gte: new Date(from) } }
            ]
        })

        if (conflict) {
            return NextResponse.json(
                { success: false, error: 'CONFLICT', message: 'Machine is already assigned during this period' },
                { status: 409 }
            )
        }

        // Create assignment
        const assignment = await MachineAssignment.create({
            machineId,
            machineCode: machine.machineCode,
            projectId,
            assignedToUserId,
            assignedByUserId: payload.userId,
            fromDate: new Date(from),
            toDate: new Date(to),
            notes,
            status: 'ACTIVE',
        })

        // Update machine status
        await Machine.findByIdAndUpdate(machineId, {
            status: MachineStatus.ASSIGNED,
            currentProjectId: projectId,
            currentAssignedTo: assignedToUserId,
        })

        return NextResponse.json(
            {
                success: true,
                data: {
                    assignmentId: assignment._id,
                    machineCode: machine.machineCode,
                    projectId,
                    from: assignment.fromDate,
                    to: assignment.toDate,
                },
                message: 'Machine assigned successfully',
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

// GET machine assignments
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ machineId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { machineId } = await params

        const assignments = await MachineAssignment.find({ machineId })
            .sort({ fromDate: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: assignments,
            count: assignments.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
