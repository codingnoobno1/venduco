import { NextResponse } from 'next/server'
import { LabourJob } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const city = searchParams.get('city')
        const skill = searchParams.get('skill')
        
        const query: any = { status: 'OPEN' }
        if (city) query.city = new RegExp(city, 'i')
        if (skill) query.skillsRequired = { $in: [new RegExp(skill, 'i')] }

        const jobs = await LabourJob.find(query).sort({ createdAt: -1 })

        // Map to response format
        const data = jobs.map(job => ({
            jobId: job._id,
            title: job.title,
            vendorName: 'ABC Infra', // In reality, fetch from Vendor model
            location: job.location,
            salaryPerDay: job.salaryPerDay,
            duration: job.duration,
            accommodation: job.accommodation
        }))

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error: any) {
        console.error('Fetch Jobs Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
