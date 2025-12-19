export const dynamic = 'force-static';
// Daily Plan API - Get today's tasks, machines, and materials
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Task, MachineAssignment, Machine } from '@/models'
import mongoose from 'mongoose'

// MaterialRequest model (if exists)
const MaterialRequest = mongoose.models.MaterialRequest

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Get tasks for today
        const taskQuery: any = {
            assignedTo: payload.userId,
            $or: [
                { dueDate: { $gte: today, $lt: tomorrow } },
                { status: { $in: ['TODO', 'IN_PROGRESS'] } }
            ]
        }
        if (projectId) {
            taskQuery.projectId = projectId
        }

        const tasks = await Task.find(taskQuery)
            .sort({ priority: -1, dueDate: 1 })
            .lean()

        // Get machines assigned
        const machineQuery: any = {
            $or: [
                { supervisorId: payload.userId },
                { projectId: projectId }
            ],
            status: 'ACTIVE'
        }

        const assignments = await MachineAssignment.find(machineQuery)
            .populate('machineId', 'machineCode machineType manufacturer status')
            .lean()

        const machines = assignments.map((a: any) => ({
            ...a.machineId,
            assignmentId: a._id,
        }))

        // Get expected materials
        let materials: any[] = []
        if (MaterialRequest) {
            materials = await MaterialRequest.find({
                projectId,
                status: { $in: ['APPROVED', 'SHIPPED'] },
                requiredBy: { $gte: today, $lt: tomorrow }
            }).lean()
        }

        return NextResponse.json({
            success: true,
            date: today.toISOString(),
            tasks,
            machines,
            materials,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
