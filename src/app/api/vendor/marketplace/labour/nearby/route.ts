import { NextResponse } from 'next/server'
import { User, UserRole } from '@/models'
import dbConnect from '@/lib/db'

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const lat = parseFloat(searchParams.get('lat') || '0')
        const lng = parseFloat(searchParams.get('lng') || '0')
        const radius = parseInt(searchParams.get('radius') || '20') // km

        if (!lat || !lng) {
            return NextResponse.json({ success: false, message: 'Latitude and Longitude are required' }, { status: 400 })
        }

        const workers = await User.find({
            requestedRole: UserRole.LABOUR,
            isAvailable: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            }
        }).select('name phone city labourSkills labourExperience trustScore urgentAvailability')

        return NextResponse.json({
            success: true,
            data: workers
        })

    } catch (error: any) {
        console.error('Nearby Search Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
