import { NextResponse } from 'next/server'
import { LabourJob } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const vendorId = searchParams.get('vendorId')

        if (!vendorId) {
            return NextResponse.json({ success: false, message: 'VendorId is required' }, { status: 400 })
        }

        const jobs = await LabourJob.find({ vendorId }).sort({ createdAt: -1 })

        return NextResponse.json({
            success: true,
            data: jobs
        })

    } catch (error: any) {
        console.error('Fetch Vendor Jobs Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
