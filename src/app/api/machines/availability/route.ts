export const dynamic = 'force-dynamic';
// Machine Availability API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Machine, MachineAssignment, MachineStatus } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const type = searchParams.get('type')

        const checkDate = date ? new Date(date) : new Date()

        // Build machine query
        const machineQuery: any = { isActive: true }
        if (type) machineQuery.machineType = type

        // Get all machines
        const allMachines = await Machine.find(machineQuery).lean()

        // Get active assignments for the date
        const assignmentQuery: any = {
            status: 'ACTIVE',
            fromDate: { $lte: checkDate },
            toDate: { $gte: checkDate },
        }

        const activeAssignments = await MachineAssignment.find(assignmentQuery).lean()
        const assignedMachineIds = new Set(activeAssignments.map(a => a.machineId))

        // Categorize machines
        const available: any[] = []
        const assigned: any[] = []
        const maintenance: any[] = []

        for (const machine of allMachines) {
            const machineId = String(machine._id)

            if (machine.status === MachineStatus.MAINTENANCE || machine.status === MachineStatus.OUT_OF_SERVICE) {
                maintenance.push({
                    machineId,
                    code: machine.machineCode,
                    name: machine.name,
                    type: machine.machineType,
                    reason: machine.status,
                })
            } else if (assignedMachineIds.has(machineId)) {
                const assignment = activeAssignments.find(a => a.machineId === machineId)
                assigned.push({
                    machineId,
                    code: machine.machineCode,
                    name: machine.name,
                    type: machine.machineType,
                    projectId: assignment?.projectId,
                    assignedTo: assignment?.assignedToUserId,
                    from: assignment?.fromDate,
                    to: assignment?.toDate,
                })
            } else {
                available.push({
                    machineId,
                    code: machine.machineCode,
                    name: machine.name,
                    type: machine.machineType,
                    capacity: machine.capacity,
                })
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                date: checkDate.toISOString().split('T')[0],
                available,
                assigned,
                maintenance,
                summary: {
                    total: allMachines.length,
                    available: available.length,
                    assigned: assigned.length,
                    maintenance: maintenance.length,
                },
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
