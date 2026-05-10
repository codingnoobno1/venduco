import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User, UserRole } from '@/models/User'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const city = searchParams.get('city')
        const skill = searchParams.get('skill')
        const query = searchParams.get('q') || ''
        const limit = parseInt(searchParams.get('limit') || '20')

        const filter: any = {
            requestedRole: UserRole.LABOUR,
            isActive: true,
            isAvailable: true
        }

        if (city) {
            filter.city = new RegExp(city, 'i')
        }

        if (skill) {
            filter.labourSkills = { $in: [new RegExp(skill, 'i')] }
        }

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { businessName: { $regex: query, $options: 'i' } },
            ]
        }

        const workers = await User.find(filter)
            .select('name email phone city labourSkills labourExperience avatar trustScore urgentAvailability')
            .limit(limit)
            .sort({ trustScore: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: workers
        })

    } catch (error: any) {
        console.error('Vendor Worker Search Error:', error)
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
