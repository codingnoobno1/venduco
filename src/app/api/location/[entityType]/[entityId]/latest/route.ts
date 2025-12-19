// Get Latest Location API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Location, Machine, User, EntityType } from '@/models'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { entityType, entityId } = await params

        // Get latest location
        const location = await Location.findOne({
            entityType: entityType.toUpperCase(),
            entityId,
        }).sort({ timestamp: -1 }).lean()

        if (!location) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'No location found' },
                { status: 404 }
            )
        }

        // Enrich with entity details
        let entityDetails: any = {}

        if (entityType.toUpperCase() === EntityType.MACHINE) {
            const machine = await Machine.findById(entityId)
                .select('machineCode name machineType currentProjectId currentAssignedTo')
                .lean()

            if (machine) {
                entityDetails = {
                    machineCode: machine.machineCode,
                    machineName: machine.name,
                    machineType: machine.machineType,
                }

                if (machine.currentAssignedTo) {
                    const assignee = await User.findById(machine.currentAssignedTo)
                        .select('name').lean()
                    entityDetails.assignedTo = assignee ? { userId: machine.currentAssignedTo, name: assignee.name } : null
                }
            }
        }

        // Calculate time ago
        const now = new Date()
        const diffMs = now.getTime() - new Date(location.timestamp).getTime()
        const diffMins = Math.floor(diffMs / 60000)
        let lastUpdatedAgo = 'just now'
        if (diffMins >= 60) {
            lastUpdatedAgo = `${Math.floor(diffMins / 60)} hours ago`
        } else if (diffMins > 0) {
            lastUpdatedAgo = `${diffMins} mins ago`
        }

        return NextResponse.json({
            success: true,
            data: {
                entityType: location.entityType,
                entityId: location.entityId,
                entityCode: location.entityCode,
                ...entityDetails,
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    accuracy: location.accuracy,
                },
                lastUpdated: location.timestamp,
                lastUpdatedAgo,
                status: diffMins < 30 ? 'ACTIVE' : 'STALE',
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
