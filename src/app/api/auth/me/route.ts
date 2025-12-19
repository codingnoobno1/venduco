export const dynamic = 'force-static';
// API Route: Get current user profile
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/db'
import { User } from '@/models'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        // Get token from Authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No token provided',
                },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify token
        let decoded: any
        try {
            decoded = jwt.verify(token, JWT_SECRET)
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid or expired token',
                },
                { status: 401 }
            )
        }

        // Get user
        const user = await User.findById(decoded.userId).select('-passwordHash')
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            )
        }

        if (!user.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account is inactive',
                },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            data: user,
        })
    } catch (error: any) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch user profile',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
