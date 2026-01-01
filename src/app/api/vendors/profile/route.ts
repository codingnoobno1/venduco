import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { VendorExperienceProfile } from '@/models/VendorExperienceProfile'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET my vendor profile
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const profile = await VendorExperienceProfile.findOne({ vendorId: payload.userId }).lean()

        return NextResponse.json({
            success: true,
            data: profile
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

// POST/PUT update vendor profile
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        // Only VENDOR role can maintain a profile
        if (payload.role !== 'VENDOR' && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Only vendors can maintain profiles' },
                { status: 403 }
            )
        }

        const body = await request.json()
        await dbConnect()

        const profile = await VendorExperienceProfile.findOneAndUpdate(
            { vendorId: payload.userId },
            { $set: { ...body, vendorId: payload.userId } },
            { upsert: true, new: true, runValidators: true }
        )

        return NextResponse.json({
            success: true,
            data: profile,
            message: 'Vendor profile updated successfully'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
