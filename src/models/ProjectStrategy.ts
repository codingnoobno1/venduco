import mongoose, { Schema, Document } from 'mongoose'

export enum StrategyStatus {
    PROPOSED = 'PROPOSED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface IProjectStrategy extends Document {
    projectId: string
    sectionId?: string
    strategyCode: string // e.g. 'NIGHT_SHIFT_WORKING', 'TBM_DOUBLE_SHIFT'
    status: StrategyStatus
    proposedBy: string
    approvedBy?: string
    justification: string
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    activeFrom?: Date
    activeUntil?: Date
    impactNotes?: string
}

const ProjectStrategySchema = new Schema<IProjectStrategy>(
    {
        projectId: { type: String, required: true, index: true },
        sectionId: { type: String, index: true },
        strategyCode: { type: String, required: true },
        status: {
            type: String,
            enum: Object.values(StrategyStatus),
            default: StrategyStatus.PROPOSED
        },
        proposedBy: { type: String, required: true },
        approvedBy: { type: String },
        justification: { type: String, required: true },
        riskLevel: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            default: 'LOW'
        },
        activeFrom: { type: Date },
        activeUntil: { type: Date },
        impactNotes: { type: String },
    },
    { timestamps: true }
)

export const ProjectStrategy = mongoose.models.ProjectStrategy ||
    mongoose.model<IProjectStrategy>('ProjectStrategy', ProjectStrategySchema)
