import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { INDUSTRY_WORK_TYPES } from '@/lib/constants/industryWorks'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        // Return the static list of industry works
        // In a real app this might be in a DB, but for now the constant is sufficient source of truth
        return NextResponse.json({
            success: true,
            data: INDUSTRY_WORK_TYPES
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
