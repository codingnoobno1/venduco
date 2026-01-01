import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { UserProfile } from '@/models'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET my profile
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        let profile = await UserProfile.findOne({ userId: payload.userId }).lean()

        // Create default profile if doesn't exist
        if (!profile) {
            profile = await UserProfile.create({
                userId: payload.userId,
                role: payload.role || '',
                headline: '',
                bio: '',
                experience: [],
                certificationSummary: [],
                authorizations: [],
                projectHistory: [],
                performance: {
                    totalProjectsCompleted: 0,
                    totalProjectValue: 0,
                    bidsWon: 0,
                    bidsTotal: 0,
                    averageSuccessRating: 0,
                    totalNCRs: 0,
                    criticalNCRs: 0
                }
            })
        }

        return NextResponse.json({
            success: true,
            data: profile
        })
    } catch (error: any) {
        console.error('Profile API Error:', error)
        return NextResponse.json(
            { success: false, message: error.message, stack: error.stack },
            { status: 500 }
        )
    }
}

// PUT update profile
export async function PUT(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const body = await request.json()

        // Calculate completion percentage
        let completion = 0
        if (body.headline) completion += 10
        if (body.bio) completion += 10
        if (body.experience?.length > 0) completion += 20
        if (body.certificationSummary?.length > 0) completion += 15
        if (body.authorizations?.length > 0) completion += 15
        if (body.projectHistory?.length > 0) completion += 30

        const profile = await UserProfile.findOneAndUpdate(
            { userId: payload.userId },
            {
                $set: {
                    ...body,
                    completionPercentage: completion,
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true, runValidators: true }
        )

        return NextResponse.json({
            success: true,
            data: profile,
            message: 'Profile updated successfully'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
