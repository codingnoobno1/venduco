import mongoose, { Schema, Document } from 'mongoose'

export interface ILabourJob extends Document {
    vendorId: string
    title: string
    location: string
    city: string
    skillsRequired: string[]
    salaryPerDay: number
    duration: string
    accommodation: boolean
    joiningDate: Date
    status: 'OPEN' | 'CLOSED' | 'COMPLETED'
    createdAt: Date
    updatedAt: Date
}

const LabourJobSchema = new Schema<ILabourJob>(
    {
        vendorId: { type: String, required: true },
        title: { type: String, required: true },
        location: { type: String, required: true },
        city: { type: String, required: true },
        skillsRequired: [{ type: String, required: true }],
        salaryPerDay: { type: Number, required: true },
        duration: { type: String, required: true },
        accommodation: { type: Boolean, default: false },
        joiningDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['OPEN', 'CLOSED', 'COMPLETED'],
            default: 'OPEN'
        }
    },
    { timestamps: true }
)

LabourJobSchema.index({ city: 1 })
LabourJobSchema.index({ skillsRequired: 1 })
LabourJobSchema.index({ status: 1 })

export const LabourJob = mongoose.models.LabourJob || mongoose.model<ILabourJob>('LabourJob', LabourJobSchema)
