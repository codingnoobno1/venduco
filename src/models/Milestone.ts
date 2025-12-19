// Milestone Model - Project phases / goals
import mongoose, { Schema, Document } from 'mongoose'

export enum MilestoneStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    DELAYED = 'DELAYED',
    CANCELLED = 'CANCELLED',
}

export interface IMilestone extends Document {
    projectId: string
    title: string
    description?: string
    phase?: string
    order: number
    plannedStartDate?: Date
    plannedEndDate?: Date
    actualStartDate?: Date
    actualEndDate?: Date
    budget?: number
    actualCost?: number
    progress: number
    deliverables?: string[]
    dependencies?: string[] // Other milestone IDs
    assignedTo?: string
    status: MilestoneStatus
    completedBy?: string
    completedAt?: Date
    notes?: string
    createdAt: Date
    updatedAt: Date
}

const MilestoneSchema = new Schema<IMilestone>(
    {
        projectId: { type: String, required: true, index: true },
        title: { type: String, required: true },
        description: { type: String },
        phase: { type: String },
        order: { type: Number, default: 0 },
        plannedStartDate: { type: Date },
        plannedEndDate: { type: Date, index: true },
        actualStartDate: { type: Date },
        actualEndDate: { type: Date },
        budget: { type: Number },
        actualCost: { type: Number },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        deliverables: [{ type: String }],
        dependencies: [{ type: String }],
        assignedTo: { type: String },
        status: {
            type: String,
            enum: Object.values(MilestoneStatus),
            default: MilestoneStatus.PENDING,
        },
        completedBy: { type: String },
        completedAt: { type: Date },
        notes: { type: String },
    },
    { timestamps: true }
)

MilestoneSchema.index({ projectId: 1, order: 1 })
MilestoneSchema.index({ projectId: 1, status: 1 })

export const Milestone = mongoose.models.Milestone ||
    mongoose.model<IMilestone>('Milestone', MilestoneSchema)
