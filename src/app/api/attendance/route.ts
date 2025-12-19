export const dynamic = 'force-dynamic';
// Attendance API - Create and list attendance records
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

// Attendance Model
const AttendanceSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    supervisorId: { type: String, required: true },
    date: { type: Date, required: true },
    skilledCount: { type: Number, required: true, min: 0 },
    unskilledCount: { type: Number, required: true, min: 0 },
    shift: { type: String, enum: ['DAY', 'NIGHT', 'DOUBLE'], default: 'DAY' },
    notes: String,
}, { timestamps: true })

AttendanceSchema.index({ projectId: 1, date: -1 })
AttendanceSchema.index({ supervisorId: 1, date: -1 })

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)

export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { projectId, skilledCount, unskilledCount, shift, notes } = body

        if (!projectId || (skilledCount === undefined && unskilledCount === undefined)) {
            return NextResponse.json(
                { success: false, message: 'Project ID and worker counts are required' },
                { status: 400 }
            )
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Upsert - update if exists for today, else create
        const attendance = await Attendance.findOneAndUpdate(
            {
                projectId,
                supervisorId: payload.userId,
                date: today,
            },
            {
                projectId,
                supervisorId: payload.userId,
                date: today,
                skilledCount: skilledCount || 0,
                unskilledCount: unskilledCount || 0,
                shift: shift || 'DAY',
                notes,
            },
            { upsert: true, new: true }
        )

        return NextResponse.json({
            success: true,
            data: attendance,
            message: 'Attendance marked successfully',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const records = await Attendance.find({ supervisorId: payload.userId })
            .sort({ date: -1 })
            .limit(30)
            .lean()

        return NextResponse.json({
            success: true,
            data: records,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
