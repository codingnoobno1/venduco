import mongoose, { Schema, Document } from 'mongoose'

export interface ILabourApplication extends Document {
    jobId: mongoose.Types.ObjectId
    labourId: mongoose.Types.ObjectId
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
    appliedAt: Date
    updatedAt: Date
}

const LabourApplicationSchema = new Schema<ILabourApplication>(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'LabourJob', required: true },
        labourId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
            default: 'PENDING'
        }
    },
    { timestamps: true }
)

LabourApplicationSchema.index({ jobId: 1, labourId: 1 }, { unique: true })

export const LabourApplication = mongoose.models.LabourApplication || mongoose.model<ILabourApplication>('LabourApplication', LabourApplicationSchema)
