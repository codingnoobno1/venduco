import mongoose, { Schema, Document } from 'mongoose'

export enum ProgressStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

export interface ISectionProgress extends Document {
    sectionId: mongoose.Types.ObjectId | string
    taskId?: mongoose.Types.ObjectId | string
    contractId: mongoose.Types.ObjectId | string
    date: Date
    workType: string // EARTHWORK | PCC | LAYING | WELDING etc
    quantityDone: number
    unit: string // m | km | tons
    progressPercent: number
    remarks?: string
    evidencePhotos?: string[]
    status: ProgressStatus
    verifiedBy?: mongoose.Types.ObjectId | string
    verifiedAt?: Date
    rejectionReason?: string
    resourceUsage?: {
        machines?: string[] // IDs of MachineAssignments or rentals
        laborCount?: number
        materialSource?: string
    }
    createdAt: Date
    updatedAt: Date
}

const SectionProgressSchema = new Schema<ISectionProgress>(
    {
        sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection', required: true, index: true },
        taskId: { type: Schema.Types.ObjectId, ref: 'EngineeringTask', index: true },
        contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
        date: { type: Date, required: true },
        workType: { type: String, required: true },
        quantityDone: { type: Number, required: true },
        unit: { type: String, required: true },
        progressPercent: { type: Number, required: true, min: 0, max: 100 },
        remarks: { type: String },
        evidencePhotos: [{ type: String }],
        status: {
            type: String,
            enum: Object.values(ProgressStatus),
            default: ProgressStatus.DRAFT,
        },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
        rejectionReason: { type: String },
        resourceUsage: {
            machines: [{ type: String }],
            laborCount: { type: Number },
            materialSource: { type: String },
        },
    },
    { timestamps: true }
)

SectionProgressSchema.index({ sectionId: 1, date: 1 })
SectionProgressSchema.index({ contractId: 1, status: 1 })

export const SectionProgress = mongoose.models.SectionProgress || mongoose.model<ISectionProgress>('SectionProgress', SectionProgressSchema)
