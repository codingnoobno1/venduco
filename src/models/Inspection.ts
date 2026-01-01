import mongoose, { Schema, Document } from 'mongoose'

export enum InspectionType {
    SITE = 'SITE',
    MATERIAL = 'MATERIAL',
    MACHINE = 'MACHINE',
    WORK = 'WORK',
}

export enum InspectionStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface IInspection extends Document {
    invoiceId?: mongoose.Types.ObjectId | string
    progressId?: mongoose.Types.ObjectId | string
    inspectionType: InspectionType
    inspectorId: mongoose.Types.ObjectId | string
    scheduledDate: Date
    completedDate?: Date
    status: InspectionStatus
    remarks?: string
    attachmentUrls?: string[]
    testingRequired: boolean
    testReportIds?: mongoose.Types.ObjectId[] | string[]
    createdAt: Date
    updatedAt: Date
}

const InspectionSchema = new Schema<IInspection>(
    {
        invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', index: true },
        progressId: { type: Schema.Types.ObjectId, ref: 'SectionProgress', index: true },
        inspectionType: {
            type: String,
            enum: Object.values(InspectionType),
            required: true,
        },
        inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        scheduledDate: { type: Date, required: true },
        completedDate: { type: Date },
        status: {
            type: String,
            enum: Object.values(InspectionStatus),
            default: InspectionStatus.PENDING,
        },
        remarks: { type: String },
        attachmentUrls: [{ type: String }],
        testingRequired: { type: Boolean, default: false },
        testReportIds: [{ type: Schema.Types.ObjectId, ref: 'TestReport' }],
    },
    { timestamps: true }
)

export const Inspection = mongoose.models.Inspection || mongoose.model<IInspection>('Inspection', InspectionSchema)
