import mongoose, { Schema, Document } from 'mongoose'

export enum AlertSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL'
}

export enum AlertType {
    BUDGET_THRESHOLD = 'BUDGET_THRESHOLD',
    SECTION_OVERRUN = 'SECTION_OVERRUN',
    CASH_SHORTAGE = 'CASH_SHORTAGE',
    BURN_RATE_HIGH = 'BURN_RATE_HIGH'
}

export interface ICostAlert extends Document {
    projectId: string
    sectionId?: string

    // Alert details
    alertType: AlertType
    severity: AlertSeverity
    message: string

    // Financial context
    budgetedAmount?: number
    actualAmount?: number
    utilizationPercentage?: number

    // Status
    isActive: boolean
    isAcknowledged: boolean
    acknowledgedBy?: string
    acknowledgedAt?: Date

    // Notification
    notifiedUsers: string[]

    // Metadata
    triggeredAt: Date
}

const CostAlertSchema = new Schema<ICostAlert>(
    {
        projectId: { type: String, required: true, index: true },
        sectionId: { type: String, index: true },

        alertType: { type: String, enum: Object.values(AlertType), required: true },
        severity: { type: String, enum: Object.values(AlertSeverity), required: true },
        message: { type: String, required: true },

        budgetedAmount: { type: Number },
        actualAmount: { type: Number },
        utilizationPercentage: { type: Number },

        isActive: { type: Boolean, default: true },
        isAcknowledged: { type: Boolean, default: false },
        acknowledgedBy: { type: String },
        acknowledgedAt: { type: Date },

        notifiedUsers: [{ type: String }],
        triggeredAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
)

CostAlertSchema.index({ projectId: 1, isActive: 1, isAcknowledged: 1 })

export const CostAlert = mongoose.models.CostAlert ||
    mongoose.model<ICostAlert>('CostAlert', CostAlertSchema)
