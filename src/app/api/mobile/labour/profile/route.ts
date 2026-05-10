import { NextResponse } from 'next/server'
import { User } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const labourId = searchParams.get('labourId')

        if (!labourId) {
            return NextResponse.json({ success: false, message: 'LabourId is required' }, { status: 400 })
        }

        const user = await User.findById(labourId)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Labour not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                city: user.city,
                skills: user.labourSkills,
                experience: user.labourExperience,
                isAvailable: user.isAvailable,
                currentTeamId: user.currentTeamId
            }
        })

    } catch (error: any) {
        console.error('Profile Fetch Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { labourId, ...updateData } = body

        if (!labourId) {
            return NextResponse.json({ success: false, message: 'LabourId is required' }, { status: 400 })
        }

        const user = await User.findByIdAndUpdate(
            labourId,
            { $set: updateData },
            { new: true }
        )

        if (!user) {
            return NextResponse.json({ success: false, message: 'Labour not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        })

    } catch (error: any) {
        console.error('Profile Update Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
