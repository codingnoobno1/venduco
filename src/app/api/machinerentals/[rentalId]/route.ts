// Single Rental API - Approve, Assign, Status Update
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { MachineRental, RentalStatus, User, Notification, NotificationType, Machine, MachineStatus } from '@/models'

// GET single rental
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ rentalId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { rentalId } = await params

        const rental = await MachineRental.findById(rentalId).lean()
        if (!rental) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Rental not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: rental })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT - Approve/Reject/Assign/Complete
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ rentalId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { rentalId } = await params
        const body = await request.json()
        const { action, agreedRate, approvalNotes, assignedToUserId, assignedToUserName, cancellationReason } = body

        const rental = await MachineRental.findById(rentalId)
        if (!rental) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Rental not found' },
                { status: 404 }
            )
        }

        const user = await User.findById(payload.userId).select('name').lean()

        switch (action) {
            case 'APPROVE':
                // Vendor approves rental request
                if (rental.vendorId !== payload.userId) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only owner can approve' },
                        { status: 403 }
                    )
                }
                rental.status = RentalStatus.APPROVED
                rental.approvedBy = payload.userId
                rental.approvedAt = new Date()
                rental.agreedRate = agreedRate || rental.proposedRate || rental.dailyRate
                rental.approvalNotes = approvalNotes
                rental.estimatedCost = rental.agreedRate * (rental.requestedDays || 1)

                // Notify PM
                await Notification.create({
                    userId: rental.requestedBy!,
                    type: NotificationType.REPORT_APPROVED,
                    title: '✅ Rental Approved!',
                    message: `Your rental request for ${rental.machineCode} has been approved`,
                    priority: 'HIGH',
                    data: { entityType: 'RENTAL', entityId: rentalId },
                })
                break

            case 'REJECT':
                // Vendor rejects
                if (rental.vendorId !== payload.userId) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only owner can reject' },
                        { status: 403 }
                    )
                }
                rental.status = RentalStatus.CANCELLED
                rental.cancellationReason = cancellationReason || 'Request rejected by vendor'

                await Notification.create({
                    userId: rental.requestedBy!,
                    type: NotificationType.REPORT_REJECTED,
                    title: '❌ Rental Rejected',
                    message: `Your rental request for ${rental.machineCode} was not approved`,
                    priority: 'NORMAL',
                    data: { entityType: 'RENTAL', entityId: rentalId },
                })
                break

            case 'ASSIGN':
                // PM assigns to project/supervisor
                if (rental.requestedBy !== payload.userId) {
                    return NextResponse.json(
                        { success: false, error: 'FORBIDDEN', message: 'Only requester can assign' },
                        { status: 403 }
                    )
                }
                rental.status = RentalStatus.ASSIGNED
                rental.assignedBy = payload.userId
                rental.assignedAt = new Date()
                rental.assignedToUserId = assignedToUserId
                rental.assignedToUserName = assignedToUserName

                // Update machine status
                await Machine.findByIdAndUpdate(rental.machineId, {
                    status: MachineStatus.ASSIGNED,
                    currentProjectId: rental.projectId,
                    currentAssignedTo: assignedToUserId,
                })

                // Notify vendor and assignee
                await Notification.create({
                    userId: rental.vendorId,
                    type: NotificationType.MACHINE_ASSIGNED,
                    title: '🚜 Machine Assigned',
                    message: `${rental.machineCode} has been assigned to project ${rental.projectName}`,
                    priority: 'NORMAL',
                    data: { entityType: 'RENTAL', entityId: rentalId },
                })

                if (assignedToUserId) {
                    await Notification.create({
                        userId: assignedToUserId,
                        type: NotificationType.MACHINE_ASSIGNED,
                        title: '🚜 Machine Assigned to You',
                        message: `${rental.machineCode} has been assigned to you for ${rental.projectName}`,
                        priority: 'HIGH',
                        data: { entityType: 'RENTAL', entityId: rentalId },
                    })
                }
                break

            case 'START':
                // Start rental period
                rental.status = RentalStatus.IN_USE
                rental.actualStartDate = new Date()
                break

            case 'COMPLETE':
                // End rental period
                rental.status = RentalStatus.COMPLETED
                rental.actualEndDate = new Date()
                rental.isAvailableForRent = false

                // Calculate actual cost
                if (rental.actualStartDate) {
                    const actualDays = Math.ceil((Date.now() - rental.actualStartDate.getTime()) / (1000 * 60 * 60 * 24))
                    rental.actualCost = (rental.agreedRate || rental.dailyRate) * actualDays
                }

                // Update machine status back to available
                await Machine.findByIdAndUpdate(rental.machineId, {
                    status: MachineStatus.AVAILABLE,
                    currentProjectId: undefined,
                    currentAssignedTo: undefined,
                })

                // Notify all parties
                const recipients = [rental.vendorId, rental.requestedBy, rental.assignedToUserId].filter(Boolean) as string[]
                for (const userId of recipients) {
                    await Notification.create({
                        userId,
                        type: NotificationType.TASK_COMPLETED,
                        title: '✓ Rental Completed',
                        message: `Rental period for ${rental.machineCode} has ended`,
                        priority: 'NORMAL',
                        data: { entityType: 'RENTAL', entityId: rentalId },
                    })
                }
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'INVALID_ACTION', message: 'Invalid action' },
                    { status: 400 }
                )
        }

        await rental.save()

        return NextResponse.json({
            success: true,
            data: rental,
            message: `Rental ${action.toLowerCase()}ed successfully`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PATCH - Update operational hours/status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ rentalId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { rentalId } = await params
        const body = await request.json()
        const { hoursUsed, notes } = body

        const rental = await MachineRental.findById(rentalId)
        if (!rental) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Rental not found' },
                { status: 404 }
            )
        }

        // Add operational log
        rental.operationalLogs = rental.operationalLogs || []
        rental.operationalLogs.push({
            date: new Date(),
            hoursUsed,
            notes,
            loggedBy: payload.userId,
        })

        // Update total hours
        rental.totalHoursUsed = (rental.totalHoursUsed || 0) + hoursUsed

        await rental.save()

        return NextResponse.json({
            success: true,
            data: { totalHoursUsed: rental.totalHoursUsed },
            message: 'Usage logged successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
