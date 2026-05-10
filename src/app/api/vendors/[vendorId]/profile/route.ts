import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import VendorExperienceProfile from '@/models/VendorExperienceProfile'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { vendorId } = await params

        const profile = await VendorExperienceProfile.findOne({ vendorId }).lean()

        // Even if no profile is found, return success with null data rather than 404
        // so the UI can handle "Profile incomplete" gracefully
        return NextResponse.json({
            success: true,
            data: profile
        })

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
