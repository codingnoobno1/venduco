export const dynamic = 'force-static';
// Step 2 API: Profile Setup
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { User, RegistrationStatus, UserRole } from '@/models'

export async function PUT(request: NextRequest) {
    try {
        // Verify token
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { city, state, preferredLanguage, requestedRole, operatingRegions } = body

        // Validation
        if (!city || !state || !requestedRole) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'City, state and role are required' },
                { status: 400 }
            )
        }

        // Validate role
        if (!Object.values(UserRole).includes(requestedRole)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Invalid role', field: 'requestedRole' },
                { status: 400 }
            )
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            payload.userId,
            {
                city,
                state,
                preferredLanguage: preferredLanguage || 'en',
                requestedRole,
                operatingRegions: operatingRegions || [],
                registrationStep: 2,
                registrationStatus: RegistrationStatus.ROLE_DECLARED,
            },
            { new: true }
        )

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                registrationStep: 2,
                status: user.registrationStatus,
                requestedRole: user.requestedRole,
            },
            message: 'Profile updated successfully',
        })
    } catch (error: any) {
        console.error('Step 2 error:', error)
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
