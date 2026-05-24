export const dynamic = 'force-dynamic';
// API Route: User Login
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/db'
import { User } from '@/models'
import { corsJson, OPTIONS } from '@/lib/cors'

export { OPTIONS }

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        const body = await request.json()
        const { email, password } = body

        // Validation
        if (!email || !password) {
            return corsJson(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return corsJson(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Check if user is active
        if (!user.isActive) {
            return corsJson(
                { success: false, error: 'Account is inactive. Please contact support.' },
                { status: 403 }
            )
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
        if (!isPasswordValid) {
            return corsJson(
                { success: false, error: 'Invalid email or password' },
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
                role: user.requestedRole,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            role: user.requestedRole,
            lastLoginAt: user.lastLoginAt,
        }

        return corsJson({
            success: true,
            data: { user: userResponse, token },
            message: 'Login successful',
        })
    } catch (error: any) {
        console.error('Error logging in user:', error)
        return corsJson(
            { success: false, error: 'Failed to login', message: error.message },
            { status: 500 }
        )
    }
}
