// Vendors Search API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { User, UserRole } from '@/models/User'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''
        const limit = parseInt(searchParams.get('limit') || '10')

        const filter: any = {
            requestedRole: UserRole.VENDOR,
            isActive: true,
        }

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { businessName: { $regex: query, $options: 'i' } },
            ]
        }

        const vendors = await User.find(filter)
            .select('name businessName email phone city state serviceCategories avatar')
            .limit(limit)
            .lean()

        return NextResponse.json({
            success: true,
            data: vendors
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
