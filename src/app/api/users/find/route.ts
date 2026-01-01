// Find User by Email API for collaboration
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User } from '@/models/User'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            )
        }

        await dbConnect()
        const user = await User.findOne({ email }).select('name email requestedRole').lean()

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: user
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
