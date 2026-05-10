import { NextResponse } from 'next/server'
import { LabourTeam } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { previousTeamId, newLocation, newName } = body

        if (!previousTeamId) {
            return NextResponse.json({ success: false, message: 'PreviousTeamId is required' }, { status: 400 })
        }

        const oldTeam = await LabourTeam.findById(previousTeamId)
        if (!oldTeam) {
            return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 })
        }

        // Duplicate the team with a new name and location
        const newTeam = await LabourTeam.create({
            name: newName || `${oldTeam.name} (Rehire)`,
            leaderId: oldTeam.leaderId,
            memberIds: oldTeam.memberIds,
            projectLocation: newLocation
        })

        return NextResponse.json({
            success: true,
            message: 'Team rehired successfully',
            data: newTeam
        })

    } catch (error: any) {
        console.error('Rehire Team Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
