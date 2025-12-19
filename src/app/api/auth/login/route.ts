export const dynamic = 'force-dynamic';
// API Route: User Login
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/db'
import { User } from '@/models'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        const body = await request.json()
        const { email, password } = body

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email and password are required',
                },
                { status: 400 }
            )
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            )
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account is inactive. Please contact support.',
                },
                { status: 403 }
            )
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            )
        }

        // Update last login
        user.lastLoginAt = new Date()
        await user.save()

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                name: user.name,
            },
            JWT_SECRET,
            {
                expiresIn: '7d', // Token valid for 7 days
            }
        )

        // User response (without password)
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
        }

        return NextResponse.json({
            success: true,
            data: {
                user: userResponse,
                token,
            },
            message: 'Login successful',
        })
    } catch (error: any) {
        console.error('Error logging in user:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to login',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
