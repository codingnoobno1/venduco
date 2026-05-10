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

        // Mocking some analytics data for now, but connecting to real models
        const totalWorkers = await User.countDocuments({ requestedRole: UserRole.LABOUR })
        const activeTeams = await LabourTeam.countDocuments()
        const openJobs = await LabourJob.countDocuments({ vendorId, status: 'OPEN' })
        
        // Workforce utilization (mock logic)
        const utilization = [
            { name: 'Jan', active: 45, idle: 15 },
            { name: 'Feb', active: 52, idle: 12 },
            { name: 'Mar', active: 68, idle: 8 },
            { name: 'Apr', active: 75, idle: 5 },
            { name: 'May', active: 82, idle: 4 },
        ]

        // Skill distribution
        const skillDistribution = [
            { skill: 'Helper', count: 65 },
            { skill: 'Welder', count: 24 },
            { skill: 'Electrician', count: 18 },
            { skill: 'Operator', count: 12 },
        ]

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalWorkers,
                    activeTeams,
                    openJobs,
                    idleWorkers: 14 // Mock
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
