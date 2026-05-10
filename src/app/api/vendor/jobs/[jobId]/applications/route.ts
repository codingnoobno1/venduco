import { NextResponse } from 'next/server'
import { LabourApplication } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(
    req: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        await dbConnect()
        const { jobId } = params

        const applications = await LabourApplication.find({ jobId })
            .populate('labourId', 'name phone city labourSkills labourExperience')
            .sort({ createdAt: -1 })

        return NextResponse.json({
            success: true,
            data: applications
        })

    } catch (error: any) {
        console.error('Fetch Applications Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
