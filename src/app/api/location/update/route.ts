export const dynamic = 'force-static';
// Location Update API - Receive GPS from MAUI/Mobile
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Location, Machine, EntityType } from '@/models'

export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { entityType, entityId, lat, lng, accuracy, altitude, speed, heading, batteryLevel, timestamp } = body

        // Validation
        if (!entityType || !entityId || lat === undefined || lng === undefined) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Entity type, ID, lat and lng are required' },
                { status: 400 }
            )
        }

        if (!Object.values(EntityType).includes(entityType)) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Invalid entity type' },
                { status: 400 }
            )
        }

        // Get entity code
        let entityCode = entityId
        let projectId = undefined

        if (entityType === EntityType.MACHINE) {
            const machine = await Machine.findById(entityId).select('machineCode currentProjectId').lean()
            if (machine) {
                entityCode = machine.machineCode
                projectId = machine.currentProjectId

                // Update machine's last location
                await Machine.findByIdAndUpdate(entityId, {
                    lastLocation: {
                        lat,
                        lng,
                        updatedAt: new Date(),
                    },
                })
            }
        }

        // Store location
        const location = await Location.create({
            entityType,
            entityId,
            entityCode,
            lat,
            lng,
            accuracy,
            altitude,
            speed,
            heading,
            batteryLevel,
            projectId,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
        })

        return NextResponse.json({
            success: true,
            data: {
                locationId: location._id,
                entityCode,
                timestamp: location.timestamp,
            },
            message: 'Location updated',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
