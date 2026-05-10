import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { labourId, jobId, type } = body // type: 'CHECK_IN' | 'CHECK_OUT'

        if (!labourId || !jobId || !type) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
        }

        // In a real app, save to an Attendance model
        console.log(`Attendance ${type} for labour ${labourId} at job ${jobId}`)

        return NextResponse.json({
            success: true,
            message: `Successfully ${type.toLowerCase().replace('_', ' ')}`
        })

    } catch (error: any) {
        console.error('Attendance Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
