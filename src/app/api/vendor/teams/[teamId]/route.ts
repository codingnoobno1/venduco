import { NextResponse } from 'next/server'
import { LabourTeam } from '@/models'
import dbConnect from '@/lib/db'

export async function PATCH(
    req: Request,
    { params }: { params: { teamId: string } }
) {
    try {
        await dbConnect()
        const { teamId } = params
        const body = await req.json()
        const { action, data } = body // action: 'ASSIGN_SUPERVISOR' | 'ADD_WORKER' | 'REMOVE_WORKER' | 'UPDATE_INFO'

        let update: any = {}

        switch (action) {
            case 'ASSIGN_SUPERVISOR':
                update = { leaderId: data.supervisorId }
                break
            case 'ADD_WORKER':
                update = { $addToSet: { memberIds: data.workerId } }
                break
            case 'REMOVE_WORKER':
                update = { $pull: { memberIds: data.workerId } }
                break
            case 'UPDATE_INFO':
                update = data
                break
            default:
                return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
        }

        const team = await LabourTeam.findByIdAndUpdate(teamId, update, { new: true })

        if (!team) {
            return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'Team updated successfully',
            data: team
        })

    } catch (error: any) {
        console.error('Update Team Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
