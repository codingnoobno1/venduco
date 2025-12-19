export const dynamic = 'force-dynamic';
// Daily Plan Lock API - Freeze day's work
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

// DayLock Model
const DayLockSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    supervisorId: { type: String, required: true },
    date: { type: Date, required: true },
    lockedAt: { type: Date, default: Date.now },
    lockedBy: String,
    // Frozen data snapshot
    snapshot: {
        tasks: [{
            taskId: String,
            title: String,
            progress: Number,
        }],
        attendance: {
            skilledCount: Number,
            unskilledCount: Number,
            shift: String,
        },
        notes: String,
    }
}, { timestamps: true })

DayLockSchema.index({ projectId: 1, supervisorId: 1, date: 1 }, { unique: true })

const DayLock = mongoose.models.DayLock || mongoose.model('DayLock', DayLockSchema)

// Check if day is locked
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        const dateStr = searchParams.get('date')

        const date = dateStr ? new Date(dateStr) : new Date()
        date.setHours(0, 0, 0, 0)

        const lock = await DayLock.findOne({
            projectId,
            supervisorId: payload.userId,
            date,
        }).lean()

        return NextResponse.json({
            success: true,
            isLocked: !!lock,
            lock,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// Lock the day
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { projectId, snapshot } = body

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if already locked
        const existing = await DayLock.findOne({
            projectId,
            supervisorId: payload.userId,
            date: today,
        })

        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Day is already locked' },
                { status: 400 }
            )
        }

        const lock = await DayLock.create({
            projectId,
            supervisorId: payload.userId,
            date: today,
            lockedBy: payload.name || 'Supervisor',
            snapshot,
        })

        return NextResponse.json({
            success: true,
            data: lock,
            message: 'Day locked successfully. No further edits allowed.',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
