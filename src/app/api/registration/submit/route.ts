export const dynamic = 'force-dynamic';
// Submit Registration API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { User, RegistrationStatus } from '@/models'

export async function POST(request: NextRequest) {
    try {
        // Verify token
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json().catch(() => ({}))
        const { additionalNotes } = body

        // Get user
        const user = await User.findById(payload.userId)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        // Check if user has completed required steps
        if (user.registrationStep < 3) {
            return NextResponse.json(
                { success: false, error: 'INCOMPLETE', message: 'Complete all required steps before submitting' },
                { status: 400 }
            )
        }

        // Update to under verification
        const updatedUser = await User.findByIdAndUpdate(
            payload.userId,
            {
                registrationStep: 5,
                registrationStatus: RegistrationStatus.UNDER_VERIFICATION,
                submittedAt: new Date(),
            },
            { new: true }
        )

        return NextResponse.json({
            success: true,
            data: {
                registrationStep: 5,
                status: RegistrationStatus.UNDER_VERIFICATION,
                submittedAt: updatedUser?.submittedAt,
            },
            message: 'Registration submitted for verification',
        })
    } catch (error: any) {
        console.error('Submit error:', error)
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
