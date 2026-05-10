import { NextResponse } from 'next/server'
import { LabourApplication } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { jobId, labourId } = body

        if (!jobId || !labourId) {
            return NextResponse.json({ success: false, message: 'JobId and LabourId are required' }, { status: 400 })
        }

        // Check if already applied
        const existing = await LabourApplication.findOne({ jobId, labourId })
        if (existing) {
            return NextResponse.json({ success: false, message: 'Already applied for this job' }, { status: 400 })
        }

        await LabourApplication.create({
            jobId,
            labourId,
            status: 'PENDING'
        })

        return NextResponse.json({
            success: true,
            message: 'Application submitted successfully'
        })

    } catch (error: any) {
        console.error('Apply Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
