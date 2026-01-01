import { MachineRental, RentalStatus } from '@/models/MachineRental'
import { MachineAssignment } from '@/models/MachineAssignment'

/**
 * Checks if a machine has any scheduling conflicts for the given date range.
 * A conflict exists if there is an active rental or assignment that overlaps.
 * 
 * @param machineId The ID of the machine to check
 * @param startDate The proposed start date
 * @param endDate The proposed end date
 * @param excludeRentalId Optional ID of a rental to exclude from the check (e.g. when updating)
 * @returns Array of conflicting assignments or rentals
 */
export async function getMachineConflicts(
    machineId: string,
    startDate: Date,
    endDate: Date,
    excludeRentalId?: string
) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // 1. Check MachineRental for overlapping requests
    // Conflicts if: (start < requestedEndDate) AND (end > requestedStartDate)
    const rentalQuery: any = {
        machineId,
        status: {
            $in: [
                RentalStatus.REQUESTED,
                RentalStatus.APPROVED,
                RentalStatus.ASSIGNED,
                RentalStatus.IN_USE
            ]
        },
        requestedStartDate: { $lt: end },
        requestedEndDate: { $gt: start }
    }

    if (excludeRentalId) {
        rentalQuery._id = { $ne: excludeRentalId }
    }

    const conflictingRentals = await MachineRental.find(rentalQuery).lean()

    // 2. Check MachineAssignment for formal assignments
    // Conflicts if: (start < toDate) AND (end > fromDate)
    const assignmentQuery = {
        machineId,
        status: 'ACTIVE',
        fromDate: { $lt: end },
        toDate: { $gt: start }
    }

    const conflictingAssignments = await MachineAssignment.find(assignmentQuery).lean()

    return {
        hasConflicts: conflictingRentals.length > 0 || conflictingAssignments.length > 0,
        conflictingRentals,
        conflictingAssignments
    }
}
