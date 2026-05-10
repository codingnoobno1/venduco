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

        // Remove from team members
        await LabourTeam.findByIdAndUpdate(
            teamId,
            { $pull: { memberIds: labourId } }
        )

        // Clear user's current team
        await User.findByIdAndUpdate(labourId, { currentTeamId: null })

        return NextResponse.json({
            success: true,
            message: 'Exited team successfully'
        })

    } catch (error: any) {
        console.error('Team Exit Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
