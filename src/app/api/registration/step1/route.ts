export const dynamic = 'force-dynamic';
// Step 1 API: Create Account
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/db'
import { User, RegistrationStatus } from '@/models'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        const body = await request.json()
        const { name, email, phone, password } = body

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Name, email and password are required' },
                { status: 400 }
            )
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Invalid email format', field: 'email' },
                { status: 400 }
            )
        }

        // Password validation
        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters', field: 'password' },
                { status: 400 }
            )
        }

        // Check duplicate email
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE_EMAIL', message: 'Email already registered' },
                { status: 409 }
            )
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            passwordHash,
            registrationStep: 1,
            registrationStatus: RegistrationStatus.PENDING_PROFILE,
        })

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        )

        return NextResponse.json(
            {
                success: true,
                data: {
                    userId: user._id,
                    token,
                    registrationStep: 1,
                    status: user.registrationStatus,
                },
                message: 'Account created successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Step 1 error:', error)
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
