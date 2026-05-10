import { NextResponse } from 'next/server'
import { LabourTeam } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { name, leaderId, memberIds, projectLocation } = body

        if (!name || !leaderId) {
            return NextResponse.json({ success: false, message: 'Name and LeaderId are required' }, { status: 400 })
        }

        const team = await LabourTeam.create({
            name,
            leaderId,
            memberIds: memberIds || [],
            projectLocation
        })

        return NextResponse.json({
            success: true,
            message: 'Team created successfully',
            data: team
        })

    } catch (error: any) {
        console.error('Team Creation Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const vendorId = searchParams.get('vendorId') // If teams are linked to vendors

        const teams = await LabourTeam.find()
            .populate('leaderId', 'name phone')
            .populate('memberIds', 'name phone labourSkills')

        return NextResponse.json({
            success: true,
            data: teams
        })

    } catch (error: any) {
        console.error('Fetch Teams Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
