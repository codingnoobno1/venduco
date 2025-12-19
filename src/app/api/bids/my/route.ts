export const dynamic = 'force-static';
// My Bids API - Get user's submitted bids
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Bid } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const query: any = { bidderId: payload.userId }
        if (status) query.status = status

        const bids = await Bid.find(query)
            .sort({ submittedAt: -1 })
            .lean()

        // Summary
        const summary = {
            total: bids.length,
            submitted: bids.filter((b: any) => b.status === 'SUBMITTED').length,
            underReview: bids.filter((b: any) => b.status === 'UNDER_REVIEW').length,
            approved: bids.filter((b: any) => b.status === 'APPROVED').length,
            rejected: bids.filter((b: any) => b.status === 'REJECTED').length,
        }

        return NextResponse.json({
            success: true,
            data: bids,
            summary,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
