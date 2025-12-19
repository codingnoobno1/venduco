export const dynamic = 'force-dynamic';
// Machine Rentals API - List available & Request rental
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { MachineRental, RentalStatus, Machine, Project, User, Notification, NotificationType } from '@/models'

// GET available rentals or my rentals
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const view = searchParams.get('view') // 'available', 'my-listings', 'my-requests'
        const machineType = searchParams.get('type')
        const location = searchParams.get('location')

        const user = await User.findById(payload.userId).select('requestedRole').lean()
        let query: any = {}

        switch (view) {
            case 'available':
                // PM/Admin view: all available for rent
                query = { status: RentalStatus.AVAILABLE, isAvailableForRent: true }
                if (machineType) query.machineType = machineType
                if (location) query.location = { $regex: location, $options: 'i' }
                break

            case 'my-listings':
                // Vendor view: my machine listings
                query = { vendorId: payload.userId }
                break

            case 'my-requests':
                // PM view: my rental requests
                query = { requestedBy: payload.userId }
                break

            case 'vendor-requests':
                // Vendor view: requests for my machines
                query = { vendorId: payload.userId, status: { $in: [RentalStatus.REQUESTED, RentalStatus.APPROVED, RentalStatus.ASSIGNED, RentalStatus.IN_USE] } }
                break

            default:
                // Default: show available
                query = { status: RentalStatus.AVAILABLE, isAvailableForRent: true }
        }

        const rentals = await MachineRental.find(query).sort({ updatedAt: -1 }).lean()

        // Mask vendor contact for non-approved rentals if PM is viewing
        const maskedRentals = rentals.map((rental: any) => {
            if (view === 'available' && rental.status !== RentalStatus.APPROVED) {
                return {
                    ...rental,
                    vendorEmail: '***@***.com',
                    vendorPhone: '**********',
                }
            }
            return rental
        })

        return NextResponse.json({
            success: true,
            data: maskedRentals,
            count: maskedRentals.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST - Create listing (Vendor) or Request rental (PM)
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const body = await request.json()
        const { action } = body

        const user = await User.findById(payload.userId).select('name email phone requestedRole businessName').lean()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        if (action === 'LIST_FOR_RENT') {
            // Vendor lists machine for rent
            const { machineId, dailyRate, weeklyRate, monthlyRate, location, availableFrom, availableTo } = body

            const machine = await Machine.findById(machineId).lean()
            if (!machine) {
                return NextResponse.json(
                    { success: false, error: 'NOT_FOUND', message: 'Machine not found' },
                    { status: 404 }
                )
            }

            // Check if already listed
            const existing = await MachineRental.findOne({ machineId, status: RentalStatus.AVAILABLE })
            if (existing) {
                return NextResponse.json(
                    { success: false, error: 'DUPLICATE', message: 'Machine already listed for rent' },
                    { status: 409 }
                )
            }

            const rental = await MachineRental.create({
                machineId,
                machineCode: (machine as any).machineCode,
                machineName: (machine as any).name,
                machineType: (machine as any).machineType,
                vendorId: payload.userId,
                vendorName: user.name,
                vendorEmail: user.email,
                vendorPhone: user.phone,
                dailyRate,
                weeklyRate,
                monthlyRate,
                location: location || (machine as any).location || 'Not specified',
                availableFrom: availableFrom ? new Date(availableFrom) : undefined,
                availableTo: availableTo ? new Date(availableTo) : undefined,
                isAvailableForRent: true,
                status: RentalStatus.AVAILABLE,
            })

            return NextResponse.json({
                success: true,
                data: { rentalId: rental._id, machineCode: rental.machineCode },
                message: 'Machine listed for rent successfully',
            }, { status: 201 })

        } else if (action === 'REQUEST_RENTAL') {
            // PM requests rental
            const { rentalId, projectId, startDate, endDate, proposedRate } = body

            const rental = await MachineRental.findById(rentalId)
            if (!rental || rental.status !== RentalStatus.AVAILABLE) {
                return NextResponse.json(
                    { success: false, error: 'NOT_AVAILABLE', message: 'Machine not available for rent' },
                    { status: 400 }
                )
            }

            const project = await Project.findById(projectId).select('name').lean()
            if (!project) {
                return NextResponse.json(
                    { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                    { status: 404 }
                )
            }

            // Calculate days
            const start = new Date(startDate)
            const end = new Date(endDate)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

            rental.requestedBy = payload.userId
            rental.requestedByName = user.name
            rental.requestedAt = new Date()
            rental.projectId = projectId
            rental.projectName = (project as any).name
            rental.requestedStartDate = start
            rental.requestedEndDate = end
            rental.requestedDays = days
            rental.proposedRate = proposedRate || rental.dailyRate
            rental.estimatedCost = (proposedRate || rental.dailyRate) * days
            rental.status = RentalStatus.REQUESTED

            await rental.save()

            // Notify vendor
            await Notification.create({
                userId: rental.vendorId,
                type: NotificationType.MACHINE_ASSIGNED,
                title: '📬 Rental Request Received',
                message: `${user.name} requested to rent ${rental.machineCode} for ${days} days`,
                priority: 'HIGH',
                data: { entityType: 'RENTAL', entityId: String(rental._id) },
            })

            return NextResponse.json({
                success: true,
                data: { rentalId: rental._id, status: rental.status },
                message: 'Rental request submitted',
            })
        }

        return NextResponse.json(
            { success: false, error: 'INVALID_ACTION', message: 'Invalid action' },
            { status: 400 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
