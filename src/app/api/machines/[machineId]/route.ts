// Single Machine API - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Machine } from '@/models'

// GET single machine
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ machineId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { machineId } = await params

        const machine = await Machine.findById(machineId).lean()

        if (!machine) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Machine not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: machine })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT update machine
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ machineId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { machineId } = await params
        const body = await request.json()

        const allowedFields = ['name', 'capacity', 'specifications', 'status']
        const updateData: any = {}

        Object.keys(body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = body[key]
            }
        })

        const machine = await Machine.findByIdAndUpdate(machineId, updateData, { new: true }).lean()

        if (!machine) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Machine not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: machine,
            message: 'Machine updated successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE machine (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ machineId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { machineId } = await params

        const machine = await Machine.findByIdAndUpdate(machineId, { isActive: false }, { new: true })

        if (!machine) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Machine not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Machine deactivated successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
