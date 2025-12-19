export const dynamic = 'force-dynamic';
// Admin API: Get pending verifications
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User, RegistrationStatus } from '@/models'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'UNDER_VERIFICATION'
        const role = searchParams.get('role')

        // Build query
        const query: any = {}
        if (status !== 'ALL') {
            query.registrationStatus = status
        }
        if (role) {
            query.requestedRole = role
        }

        const users = await User.find(query)
            .select('-passwordHash')
            .sort({ submittedAt: -1, createdAt: -1 })
            .lean()

        // Get counts
        const counts = {
            pending: await User.countDocuments({ registrationStatus: RegistrationStatus.UNDER_VERIFICATION }),
            active: await User.countDocuments({ registrationStatus: RegistrationStatus.ACTIVE }),
            rejected: await User.countDocuments({ registrationStatus: RegistrationStatus.REJECTED }),
            total: await User.countDocuments(),
        }

        return NextResponse.json({
            success: true,
            data: users,
            counts,
        })
    } catch (error: any) {
        console.error('Admin users error:', error)
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
