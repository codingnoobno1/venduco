// Machine Assignment Model
import mongoose, { Schema, Document } from 'mongoose'

export interface IMachineAssignment extends Document {
    machineId: string
    machineCode: string
    projectId: string
    assignedToUserId: string
    assignedByUserId: string
    fromDate: Date
    toDate: Date
    notes?: string
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    createdAt: Date
    updatedAt: Date
}

const MachineAssignmentSchema = new Schema<IMachineAssignment>(
    {
        machineId: { type: String, required: true, index: true },
        machineCode: { type: String, required: true },
        projectId: { type: String, required: true, index: true },
        assignedToUserId: { type: String, required: true, index: true },
        assignedByUserId: { type: String, required: true },
        fromDate: { type: Date, required: true },
        toDate: { type: Date, required: true },
        notes: { type: String },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
            default: 'ACTIVE',
        },
    },
    { timestamps: true }
)

MachineAssignmentSchema.index({ machineId: 1, status: 1 })
MachineAssignmentSchema.index({ projectId: 1, status: 1 })

export const MachineAssignment = mongoose.models.MachineAssignment ||
    mongoose.model<IMachineAssignment>('MachineAssignment', MachineAssignmentSchema)
