import { NextResponse } from 'next/server'
import { LabourJob, LabourApplication, User } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const vendorId = searchParams.get('vendorId')

        if (!vendorId) {
            return NextResponse.json({ success: false, message: 'VendorId is required' }, { status: 400 })
        }

        // 1. Get all jobs by this vendor
        const vendorJobs = await LabourJob.find({ vendorId })
        const jobIds = vendorJobs.map(job => job._id)

        // 2. Get all applications for these jobs
        const applications = await LabourApplication.find({ jobId: { $in: jobIds } })
            .populate({
                path: 'labourId',
                select: 'name phone city labourSkills labourExperience trustScore avatar isAvailable'
            })
            .populate({
                path: 'jobId',
                select: 'title location salaryPerDay openings status'
            })
            .sort({ appliedAt: -1 })

        return NextResponse.json({
            success: true,
            data: applications
        })

    } catch (error: any) {
        console.error('Fetch Vendor Applications Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
