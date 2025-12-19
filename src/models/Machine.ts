// Machine Model - Equipment registry
import mongoose, { Schema, Document } from 'mongoose'

export enum MachineType {
    TOWER_CRANE = 'TOWER_CRANE',
    MOBILE_CRANE = 'MOBILE_CRANE',
    WAGON = 'WAGON',
    EXCAVATOR = 'EXCAVATOR',
    CONCRETE_MIXER = 'CONCRETE_MIXER',
    LOADER = 'LOADER',
    BULLDOZER = 'BULLDOZER',
    TRUCK = 'TRUCK',
    OTHER = 'OTHER',
}

export enum MachineStatus {
    AVAILABLE = 'AVAILABLE',
    ASSIGNED = 'ASSIGNED',
    MAINTENANCE = 'MAINTENANCE',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export interface IMachine extends Document {
    machineCode: string
    name: string
    machineType: MachineType
    vendorId: string
    capacity?: string
    specifications?: {
        height?: string
        radius?: string
        power?: string
        model?: string
        year?: number
    }
    status: MachineStatus
    currentProjectId?: string
    currentAssignedTo?: string
    lastLocation?: {
        lat: number
        lng: number
        updatedAt: Date
    }
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const MachineSchema = new Schema<IMachine>(
    {
        machineCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        machineType: {
            type: String,
            enum: Object.values(MachineType),
            required: true,
        },
        vendorId: {
            type: String,
            required: true,
            index: true,
        },
        capacity: { type: String },
        specifications: {
            height: String,
            radius: String,
            power: String,
            model: String,
            year: Number,
        },
        status: {
            type: String,
            enum: Object.values(MachineStatus),
            default: MachineStatus.AVAILABLE,
        },
        currentProjectId: { type: String, index: true },
        currentAssignedTo: { type: String },
        lastLocation: {
            lat: Number,
            lng: Number,
            updatedAt: Date,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

MachineSchema.index({ machineType: 1, status: 1 })
MachineSchema.index({ vendorId: 1, status: 1 })

export const Machine = mongoose.models.Machine || mongoose.model<IMachine>('Machine', MachineSchema)
