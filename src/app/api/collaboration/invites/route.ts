export const dynamic = 'force-dynamic';
// Collaboration Invites API - Get my pending invites
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectCollaborator, CollaboratorStatus } from '@/models/ProjectCollaborator'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET my collaboration invites
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const query: any = { userId: payload.userId }

        if (status === 'pending') {
            query.status = CollaboratorStatus.PENDING
        } else if (status === 'accepted') {
            query.status = CollaboratorStatus.ACCEPTED
        } else if (status === 'all') {
            // No filter
        } else {
            // Default: pending and accepted
            query.status = { $in: [CollaboratorStatus.PENDING, CollaboratorStatus.ACCEPTED] }
        }

        const invites = await ProjectCollaborator.find(query)
            .sort({ invitedAt: -1 })
            .lean()

        const pendingCount = invites.filter(i => i.status === CollaboratorStatus.PENDING).length
        const acceptedCount = invites.filter(i => i.status === CollaboratorStatus.ACCEPTED).length

        return NextResponse.json({
            success: true,
            data: invites,
            counts: {
                pending: pendingCount,
                accepted: acceptedCount,
                total: invites.length,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
