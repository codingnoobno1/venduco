export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectCollaborator, CollaboratorStatus } from '@/models/ProjectCollaborator'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)

        const statusParam = searchParams.get('status')
        const page = Math.max(Number(searchParams.get('page')) || 1, 1)
        const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, MAX_LIMIT)
        const skip = (page - 1) * limit

        // Base query (always user-scoped)
        const query: Record<string, any> = {
            userId: payload.userId,
        }

        // Status filter (strict)
        if (statusParam === 'pending') {
            query.status = CollaboratorStatus.PENDING
        } else if (statusParam === 'accepted') {
            query.status = CollaboratorStatus.ACCEPTED
        } else if (statusParam === 'all') {
            // no status filter
        } else {
            query.status = {
                $in: [CollaboratorStatus.PENDING, CollaboratorStatus.ACCEPTED],
            }
        }

        // Run data + counts in parallel
        const [invites, counts] = await Promise.all([
            ProjectCollaborator.find(query)
                .sort({ invitedAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v') // avoid noise
                .lean(),

            ProjectCollaborator.aggregate([
                { $match: { userId: payload.userId } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ])

        // Normalize counts
        const countMap = counts.reduce<Record<string, number>>((acc, c) => {
            acc[c._id] = c.count
            return acc
        }, {})

        return NextResponse.json({
            success: true,
            data: invites,
            pagination: {
                page,
                limit,
                totalFetched: invites.length,
            },
            counts: {
                pending: countMap[CollaboratorStatus.PENDING] || 0,
                accepted: countMap[CollaboratorStatus.ACCEPTED] || 0,
                total:
                    (countMap[CollaboratorStatus.PENDING] || 0) +
                    (countMap[CollaboratorStatus.ACCEPTED] || 0),
            },
        })
    } catch (error) {
        console.error('Collaboration Invites API Error:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'SERVER_ERROR',
                message: 'Unable to fetch collaboration invites',
            },
            { status: 500 }
        )
    }
}
