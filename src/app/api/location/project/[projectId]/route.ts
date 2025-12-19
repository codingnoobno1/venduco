// Project Locations API - All locations for a project
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Machine, User, EntityType } from '@/models'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        // Get all machines assigned to this project with locations
        const machines = await Machine.find({
            currentProjectId: projectId,
            isActive: true,
            lastLocation: { $exists: true },
        }).lean()

        const machineLocations = machines.map(machine => ({
            entityType: EntityType.MACHINE,
            entityId: String(machine._id),
            code: machine.machineCode,
            name: machine.name,
            type: machine.machineType,
            lat: machine.lastLocation?.lat,
            lng: machine.lastLocation?.lng,
            lastUpdated: machine.lastLocation?.updatedAt,
        })).filter(m => m.lat && m.lng)

        // Time ago helper
        const timeAgo = (date: Date) => {
            const diffMins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
            if (diffMins < 1) return 'just now'
            if (diffMins < 60) return `${diffMins} mins ago`
            return `${Math.floor(diffMins / 60)} hours ago`
        }

        return NextResponse.json({
            success: true,
            data: {
                projectId,
                machines: machineLocations.map(m => ({
                    ...m,
                    lastUpdatedAgo: m.lastUpdated ? timeAgo(m.lastUpdated) : 'unknown',
                })),
                summary: {
                    totalMachines: machineLocations.length,
                    active: machineLocations.filter(m =>
                        m.lastUpdated && (Date.now() - new Date(m.lastUpdated).getTime()) < 30 * 60000
                    ).length,
                },
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
