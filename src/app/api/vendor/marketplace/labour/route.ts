import { NextResponse } from 'next/server'
import { User, UserRole } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const city = searchParams.get('city')
        const skill = searchParams.get('skill')
        const experience = searchParams.get('experience')

        const query: any = { requestedRole: UserRole.LABOUR, isAvailable: true }
        
        if (city) query.city = new RegExp(city, 'i')
        if (skill) query.labourSkills = { $in: [new RegExp(skill, 'i')] }
        if (experience) query.labourExperience = { $gte: parseInt(experience) }

        const workers = await User.find(query).select('name phone city labourSkills labourExperience avatar')

        return NextResponse.json({
            success: true,
            data: workers
        })

    } catch (error: any) {
        console.error('Marketplace Labour Fetch Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
