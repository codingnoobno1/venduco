import { NextResponse } from 'next/server'
import { User, UserRole } from '@/models'
import dbConnect from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { name, phone, city, skills, experience } = body

        if (!name || !phone) {
            return NextResponse.json({ success: false, message: 'Name and Phone are required' }, { status: 400 })
        }

        // Check if user already exists
        let user = await User.findOne({ phone })
        if (user) {
            return NextResponse.json({ success: false, message: 'User with this phone number already exists' }, { status: 400 })
        }

        // Create new labour user
        // Note: For labour, we might not have email/password initially, or we use a dummy one
        // or we allow email to be optional in the model (which I should have checked)
        // Since the model requires email, I'll use a placeholder for now or assume phone-based login
        
        user = await User.create({
            name,
            phone,
            city,
            email: `${phone}@venduco.com`, // Temporary placeholder for email
            passwordHash: 'PHONE_AUTH', // Placeholder for password
            requestedRole: UserRole.LABOUR,
            labourSkills: skills,
            labourExperience: experience,
            isAvailable: true
        })

        const token = jwt.sign(
            { userId: user._id, role: UserRole.LABOUR },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
        )

        return NextResponse.json({
            success: true,
            token,
            labourId: user._id
        })

    } catch (error: any) {
        console.error('Registration Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
