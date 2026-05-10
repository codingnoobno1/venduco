import { NextResponse } from 'next/server'
import { LabourApplication } from '@/models'
import dbConnect from '@/lib/db'

export async function PATCH(
    req: Request,
    { params }: { params: { applicationId: string } }
) {
    try {
        await dbConnect()
        const { applicationId } = params
        const body = await req.json()
        const { status } = body

        if (!status) {
            return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 })
        }

        const application = await LabourApplication.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        )

        if (!application) {
            return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'Application status updated successfully',
            data: application
        })

    } catch (error: any) {
        console.error('Update Application Status Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
