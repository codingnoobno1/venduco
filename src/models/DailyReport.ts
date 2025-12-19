// Daily Report Model
import mongoose, { Schema, Document } from 'mongoose'

export enum ReportStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface IDailyReport extends Document {
    projectId: string
    machineId?: string
    machineCode?: string
    date: Date
    workDone: string
    hoursUsed: number
    materialsUsed?: Array<{
        name: string
        quantity: number
        unit: string
    }>
    manpower?: number
    issues?: string
    photos?: string[]
    submittedBy: string
    submittedAt?: Date
    status: ReportStatus
    reviewedBy?: string
    reviewedAt?: Date
    reviewNotes?: string
    createdAt: Date
    updatedAt: Date
}

const DailyReportSchema = new Schema<IDailyReport>(
    {
        projectId: { type: String, required: true, index: true },
        machineId: { type: String, index: true },
        machineCode: { type: String },
        date: { type: Date, required: true, index: true },
        workDone: { type: String, required: true },
        hoursUsed: { type: Number, required: true, min: 0, max: 24 },
        materialsUsed: [{
            name: String,
            quantity: Number,
            unit: String,
        }],
        manpower: { type: Number, min: 0 },
        issues: { type: String },
        photos: [{ type: String }],
        submittedBy: { type: String, required: true, index: true },
        submittedAt: { type: Date },
        status: {
            type: String,
            enum: Object.values(ReportStatus),
            default: ReportStatus.SUBMITTED,
        },
        reviewedBy: { type: String },
        reviewedAt: { type: Date },
        reviewNotes: { type: String },
    },
    { timestamps: true }
)

DailyReportSchema.index({ projectId: 1, date: -1 })
DailyReportSchema.index({ submittedBy: 1, date: -1 })

export const DailyReport = mongoose.models.DailyReport ||
    mongoose.model<IDailyReport>('DailyReport', DailyReportSchema)
