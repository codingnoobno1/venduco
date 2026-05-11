import { NextResponse } from 'next/server'
import { LabourApplication } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { jobId, labourId, bidAmount, message } = body

        if (!jobId || !labourId || !bidAmount) {
            return NextResponse.json({ success: false, message: 'JobId, LabourId and BidAmount are required' }, { status: 400 })
        }

        // Check if already applied
        const existing = await LabourApplication.findOne({ jobId, labourId })
        if (existing) {
            return NextResponse.json({ success: false, message: 'Already applied for this job' }, { status: 400 })
        }

        await LabourApplication.create({
            jobId,
            labourId,
            bidAmount,
            message,
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
