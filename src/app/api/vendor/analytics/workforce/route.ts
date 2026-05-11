import { NextResponse } from 'next/server'
import { User, UserRole, LabourTeam, LabourJob, Attendance } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const vendorId = searchParams.get('vendorId')

        if (!vendorId) {
            return NextResponse.json({ success: false, message: 'VendorId is required' }, { status: 400 })
        }

        // Real analytics data
        const totalWorkers = await User.countDocuments({ requestedRole: UserRole.LABOUR })
        const activeTeams = await LabourTeam.countDocuments({ vendorId })
        const openJobs = await LabourJob.countDocuments({ vendorId, status: 'OPEN' })
        const idleWorkers = await User.countDocuments({ requestedRole: UserRole.LABOUR, isAvailable: true })
        
        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalWorkers,
                    activeTeams,
                    openJobs,
                    idleWorkers
                },
                utilization,
                skillDistribution
            }
        })

    } catch (error: any) {
        console.error('Workforce Analytics Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
