// Get Location History API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Location } from '@/models'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { entityType, entityId } = await params

        const { searchParams } = new URL(request.url)
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const limit = parseInt(searchParams.get('limit') || '100')

        const query: any = {
            entityType: entityType.toUpperCase(),
            entityId,
        }

        if (from || to) {
            query.timestamp = {}
            if (from) query.timestamp.$gte = new Date(from)
            if (to) query.timestamp.$lte = new Date(to)
        }

        const locations = await Location.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean()

        return NextResponse.json({
            success: true,
            data: locations.map(loc => ({
                lat: loc.lat,
                lng: loc.lng,
                accuracy: loc.accuracy,
                timestamp: loc.timestamp,
            })),
            count: locations.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
