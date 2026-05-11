import { NextResponse } from 'next/server'
import { LabourJob } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { title, location, city, skillsRequired, salaryPerDay, duration, accommodation, joiningDate, vendorId, openings } = body

        if (!title || !location || !city || !vendorId) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
        }

        const job = await LabourJob.create({
            vendorId,
            title,
            location,
            city,
            skillsRequired,
            salaryPerDay,
            duration,
            accommodation,
            joiningDate: new Date(joiningDate),
            openings: Number(openings) || 1,
            status: 'OPEN'
        })

        return NextResponse.json({
            success: true,
            jobId: job._id,
            message: 'Job created successfully'
        })

    } catch (error: any) {
        console.error('Job Creation Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
