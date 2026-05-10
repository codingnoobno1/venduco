import { NextResponse } from 'next/server'
import { User } from '@/models'
import dbConnect from '@/lib/db'

export async function PUT(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { available, city, skills, labourId } = body

        if (!labourId) {
            return NextResponse.json({ success: false, message: 'LabourId is required' }, { status: 400 })
        }

        const updateData: any = { isAvailable: available }
        if (city) updateData.city = city
        if (skills) updateData.labourSkills = skills

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
            message: 'Availability updated'
        })

    } catch (error: any) {
        console.error('Availability Update Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
