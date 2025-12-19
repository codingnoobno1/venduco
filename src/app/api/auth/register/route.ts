export const dynamic = 'force-dynamic';
// API Route: User Registration
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db'
import { User } from '@/models'

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        const body = await request.json()
        const { email, password, name, phone } = body

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields (email, password, name)',
                },
                { status: 400 }
            )
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email format',
                },
                { status: 400 }
            )
        }

        // Password validation (min 6 characters)
        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Password must be at least 6 characters long',
                },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email already registered',
                },
                { status: 409 }
            )
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            name,
            phone,
        })

        // Remove password from response
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
        }

        return NextResponse.json(
            {
                success: true,
                data: userResponse,
                message: 'User registered successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error registering user:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to register user',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
