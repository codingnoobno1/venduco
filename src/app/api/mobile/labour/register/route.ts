import { NextResponse } from 'next/server'
import { User, UserRole } from '@/models'
import dbConnect from '@/lib/db'
import { hashPassword, generateToken } from '../labor'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { name, email, password, phone, city, skills, experience } = body

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: 'Name, Email and Password are required' }, { status: 400 })
        }

        // Check if user already exists
        let user = await User.findOne({ email })
        if (user) {
            return NextResponse.json({ success: false, message: 'User with this email already exists' }, { status: 400 })
        }

        const hashedPassword = await hashPassword(password)

        // Create new labour user
        user = await User.create({
            name,
            email,
            phone,
            city,
            passwordHash: hashedPassword,
            requestedRole: UserRole.LABOUR,
            labourSkills: skills, // Map from 'skills'
            labourExperience: experience, // Map from 'experience'
            isAvailable: true,
            registrationStep: 3,
            registrationStatus: RegistrationStatus.ACTIVE
        })

        const token = generateToken(user._id, UserRole.LABOUR)

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error: any) {
        console.error('Registration Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
