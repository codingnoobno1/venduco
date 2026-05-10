import { NextResponse } from 'next/server'
import { Invitation } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const workerId = searchParams.get('workerId')

        if (!workerId) {
            return NextResponse.json({ success: false, message: 'WorkerId is required' }, { status: 400 })
        }

        const invitations = await Invitation.find({ workerId, status: 'PENDING' })
            .populate('vendorId', 'name businessName phone')
            .populate('jobId')
            .sort({ createdAt: -1 })

        return NextResponse.json({
            success: true,
            data: invitations
        })

    } catch (error: any) {
        console.error('Fetch Invitations Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
