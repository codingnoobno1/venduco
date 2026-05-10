import { NextResponse } from 'next/server'
import { Invitation } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ workerId: string }> }
) {
    try {
        await dbConnect()
        const { workerId } = await params
        const body = await req.json()
        const { vendorId, jobId, message } = body

        if (!vendorId) {
            return NextResponse.json({ success: false, message: 'VendorId is required' }, { status: 400 })
        }

        const invitation = await Invitation.create({
            vendorId,
            workerId,
            jobId,
            message,
            status: 'PENDING'
        })

        return NextResponse.json({
            success: true,
            message: 'Invitation sent successfully',
            data: invitation
        })

    } catch (error: any) {
        console.error('Invite Worker Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
