// MachineRental Model - Machine Rental Marketplace
import mongoose, { Schema, Document } from 'mongoose'

export enum RentalStatus {
    AVAILABLE = 'AVAILABLE',       // Machine listed for rent
    REQUESTED = 'REQUESTED',       // PM requested rental
    APPROVED = 'APPROVED',         // Vendor approved
    ASSIGNED = 'ASSIGNED',         // PM assigned to project
    IN_USE = 'IN_USE',             // Currently in use
    COMPLETED = 'COMPLETED',       // Rental period ended
    CANCELLED = 'CANCELLED',       // Cancelled by either party
}

export interface IMachineRental extends Document {
    // Machine Info
    machineId: string
    machineCode: string
    machineName: string
    machineType: string

    // Vendor (Owner)
    vendorId: string
    vendorName: string
    vendorEmail: string
    vendorPhone?: string

    // Rental Listing
    isAvailableForRent: boolean
    dailyRate: number
    weeklyRate?: number
    monthlyRate?: number
    currency: string
    location: string
    availableFrom?: Date
    availableTo?: Date

    // Rental Request (by PM)
    requestedBy?: string
    requestedByName?: string
    requestedAt?: Date
    projectId?: string
    projectName?: string
    requestedStartDate?: Date
    requestedEndDate?: Date
    requestedDays?: number
    proposedRate?: number

    // Approval (by Vendor)
    approvedBy?: string
    approvedAt?: Date
    agreedRate?: number
    approvalNotes?: string

    // Assignment (by PM)
    assignedBy?: string
    assignedAt?: Date
    assignedToUserId?: string
    assignedToUserName?: string

    // Usage Tracking
    actualStartDate?: Date
    actualEndDate?: Date
    totalHoursUsed?: number
    operationalLogs?: Array<{
        date: Date
        hoursUsed: number
        notes?: string
        loggedBy: string
    }>

    // Financials
    estimatedCost?: number
    actualCost?: number
    paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID'

    // Status
    status: RentalStatus
    cancellationReason?: string

    createdAt: Date
    updatedAt: Date
}

const MachineRentalSchema = new Schema<IMachineRental>(
    {
        // Machine
        machineId: { type: String, required: true, index: true },
        machineCode: { type: String, required: true },
        machineName: { type: String, required: true },
        machineType: { type: String, required: true },

        // Vendor
        vendorId: { type: String, required: true, index: true },
        vendorName: { type: String, required: true },
        vendorEmail: { type: String, required: true },
        vendorPhone: { type: String },

        // Listing
        isAvailableForRent: { type: Boolean, default: true },
        dailyRate: { type: Number, required: true, min: 0 },
        weeklyRate: { type: Number },
        monthlyRate: { type: Number },
        currency: { type: String, default: 'INR' },
        location: { type: String, required: true },
        availableFrom: { type: Date },
        availableTo: { type: Date },

        // Request
        requestedBy: { type: String },
        requestedByName: { type: String },
        requestedAt: { type: Date },
        projectId: { type: String },
        projectName: { type: String },
        requestedStartDate: { type: Date },
        requestedEndDate: { type: Date },
        requestedDays: { type: Number },
        proposedRate: { type: Number },

        // Approval
        approvedBy: { type: String },
        approvedAt: { type: Date },
        agreedRate: { type: Number },
        approvalNotes: { type: String },

        // Assignment
        assignedBy: { type: String },
        assignedAt: { type: Date },
        assignedToUserId: { type: String },
        assignedToUserName: { type: String },

        // Usage
        actualStartDate: { type: Date },
        actualEndDate: { type: Date },
        totalHoursUsed: { type: Number, default: 0 },
        operationalLogs: [{
            date: Date,
            hoursUsed: Number,
            notes: String,
            loggedBy: String,
        }],

        // Financials
        estimatedCost: { type: Number },
        actualCost: { type: Number },
        paymentStatus: { type: String, enum: ['PENDING', 'PARTIAL', 'PAID'], default: 'PENDING' },

        // Status
        status: {
            type: String,
            enum: Object.values(RentalStatus),
            default: RentalStatus.AVAILABLE,
        },
        cancellationReason: { type: String },
    },
    { timestamps: true }
)

// Indexes
MachineRentalSchema.index({ vendorId: 1, status: 1 })
MachineRentalSchema.index({ status: 1, isAvailableForRent: 1 })
MachineRentalSchema.index({ projectId: 1 })
MachineRentalSchema.index({ requestedBy: 1 })

export const MachineRental = mongoose.models.MachineRental ||
    mongoose.model<IMachineRental>('MachineRental', MachineRentalSchema)
