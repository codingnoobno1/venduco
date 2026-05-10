import { NextResponse } from 'next/server'
import { LabourTeam, User } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { teamId, labourId } = body

        if (!teamId || !labourId) {
            return NextResponse.json({ success: false, message: 'TeamId and LabourId are required' }, { status: 400 })
        }

        // Add to team members
        const team = await LabourTeam.findByIdAndUpdate(
            teamId,
            { $addToSet: { memberIds: labourId } },
            { new: true }
        )

        if (!team) {
            return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 })
        }

        // Update user's current team
        await User.findByIdAndUpdate(labourId, { currentTeamId: teamId })

        return NextResponse.json({
            success: true,
            message: 'Joined team successfully'
        })

    } catch (error: any) {
        console.error('Team Join Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
