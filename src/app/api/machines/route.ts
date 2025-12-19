export const dynamic = 'force-static';
// Machines API - List all & Create new
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Machine, MachineType, MachineStatus } from '@/models'

// GET all machines
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const vendorId = searchParams.get('vendorId')
        const projectId = searchParams.get('projectId')

        const query: any = { isActive: true }
        if (type) query.machineType = type
        if (status) query.status = status
        if (vendorId) query.vendorId = vendorId
        if (projectId) query.currentProjectId = projectId

        const machines = await Machine.find(query).sort({ machineCode: 1 }).lean()

        return NextResponse.json({
            success: true,
            data: machines,
            count: machines.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new machine
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { machineCode, name, machineType, vendorId, capacity, specifications } = body

        // Validation
        if (!machineCode || !name || !machineType) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Machine code, name and type are required' },
                { status: 400 }
            )
        }

        if (!Object.values(MachineType).includes(machineType)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Invalid machine type' },
                { status: 400 }
            )
        }

        // Check duplicate code
        const existing = await Machine.findOne({ machineCode: machineCode.toUpperCase() })
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'Machine code already exists' },
                { status: 409 }
            )
        }

        const machine = await Machine.create({
            machineCode: machineCode.toUpperCase(),
            name,
            machineType,
            vendorId: vendorId || payload.userId,
            capacity,
            specifications,
            status: MachineStatus.AVAILABLE,
        })

        return NextResponse.json(
            {
                success: true,
                data: {
                    machineId: machine._id,
                    machineCode: machine.machineCode,
                    status: machine.status,
                },
                message: 'Machine registered successfully',
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
