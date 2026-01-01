import mongoose, { Schema, Document } from 'mongoose'
import { BudgetCategory } from './ProjectBudget'

export enum CostSource {
    INVOICE = 'INVOICE',
    SECTION_PROGRESS = 'SECTION_PROGRESS',
    MACHINE_USAGE = 'MACHINE_USAGE',
    DIRECT_ENTRY = 'DIRECT_ENTRY'
}

export interface ICostTracking extends Document {
    projectId: string
    sectionId?: string

    // Cost details
    amount: number
    category: BudgetCategory
    description: string

    // Source tracking
    source: CostSource
    sourceId: string          // Invoice ID, Progress ID, etc.

    // Dates
    costDate: Date
    recordedBy: string

    // Classification
    isApproved: boolean
    approvedBy?: string
    approvedDate?: Date
}

const CostTrackingSchema = new Schema<ICostTracking>(
    {
        projectId: { type: String, required: true, index: true },
        sectionId: { type: String, index: true },

        amount: { type: Number, required: true },
        category: { type: String, enum: Object.values(BudgetCategory), required: true },
        description: { type: String, required: true },

        source: { type: String, enum: Object.values(CostSource), required: true },
        sourceId: { type: String, required: true },

        costDate: { type: Date, required: true },
        recordedBy: { type: String, required: true },

        isApproved: { type: Boolean, default: false },
        approvedBy: { type: String },
        approvedDate: { type: Date }
    },
    { timestamps: true }
)

// Composite index for efficient queries
CostTrackingSchema.index({ projectId: 1, sectionId: 1, category: 1 })
CostTrackingSchema.index({ projectId: 1, costDate: 1 })

export const CostTracking = mongoose.models.CostTracking ||
    mongoose.model<ICostTracking>('CostTracking', CostTrackingSchema)
