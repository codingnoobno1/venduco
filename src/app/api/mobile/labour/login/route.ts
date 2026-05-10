import { NextResponse } from 'next/server'
import { User, UserRole } from '@/models'
import dbConnect from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { phone, otp } = body

        if (!phone || !otp) {
            return NextResponse.json({ success: false, message: 'Phone and OTP are required' }, { status: 400 })
        }

        // Mock OTP verification (In production, verify against a real OTP service/DB)
        if (otp !== '123456') {
            return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 401 })
        }

        // Find user by phone
        const user = await User.findOne({ phone })
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        const token = jwt.sign(
            { userId: user._id, role: user.requestedRole || UserRole.LABOUR },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
        )

        return NextResponse.json({
            success: true,
            token,
            labour: {
                id: user._id,
                name: user.name,
                role: user.requestedRole
            }
        })

    } catch (error: any) {
        console.error('Login Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
