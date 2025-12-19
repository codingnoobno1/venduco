// Maintenance Model - Track machine servicing/repairs
import mongoose, { Schema, Document } from 'mongoose'

export enum MaintenanceType {
    SCHEDULED = 'SCHEDULED',
    EMERGENCY = 'EMERGENCY',
    PREVENTIVE = 'PREVENTIVE',
    REPAIR = 'REPAIR',
}

export enum MaintenanceStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface IMaintenance extends Document {
    machineId: string
    machineCode: string
    type: MaintenanceType
    title: string
    description?: string
    scheduledDate: Date
    completedDate?: Date
    estimatedHours?: number
    actualHours?: number
    cost?: number
    parts?: Array<{
        name: string
        quantity: number
        cost: number
    }>
    technician?: string
    technicianName?: string
    notes?: string
    photos?: string[]
    status: MaintenanceStatus
    createdBy: string
    createdAt: Date
    updatedAt: Date
}

const MaintenanceSchema = new Schema<IMaintenance>(
    {
        machineId: { type: String, required: true, index: true },
        machineCode: { type: String, required: true },
        type: {
            type: String,
            enum: Object.values(MaintenanceType),
            required: true,
        },
        title: { type: String, required: true },
        description: { type: String },
        scheduledDate: { type: Date, required: true, index: true },
        completedDate: { type: Date },
        estimatedHours: { type: Number },
        actualHours: { type: Number },
        cost: { type: Number },
        parts: [{
            name: String,
            quantity: Number,
            cost: Number,
        }],
        technician: { type: String },
        technicianName: { type: String },
        notes: { type: String },
        photos: [{ type: String }],
        status: {
            type: String,
            enum: Object.values(MaintenanceStatus),
            default: MaintenanceStatus.SCHEDULED,
        },
        createdBy: { type: String, required: true },
    },
    { timestamps: true }
)

MaintenanceSchema.index({ machineId: 1, scheduledDate: -1 })
MaintenanceSchema.index({ status: 1, scheduledDate: 1 })

export const Maintenance = mongoose.models.Maintenance ||
    mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema)
