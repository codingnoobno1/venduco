import mongoose, { Schema, Document } from 'mongoose'

export interface ISectionAssignment extends Document {
    contractId: mongoose.Types.ObjectId | string
    sectionId: mongoose.Types.ObjectId | string
    assignedDate: Date
    plannedStart: Date
    plannedEnd: Date
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    createdAt: Date
    updatedAt: Date
}

const SectionAssignmentSchema = new Schema<ISectionAssignment>(
    {
        contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
        sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection', required: true, index: true },
        assignedDate: { type: Date, default: Date.now },
        plannedStart: { type: Date, required: true },
        plannedEnd: { type: Date, required: true },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
            default: 'ACTIVE',
        },
    },
    { timestamps: true }
)

SectionAssignmentSchema.index({ contractId: 1, sectionId: 1 }, { unique: true })

export const SectionAssignment = mongoose.models.SectionAssignment || mongoose.model<ISectionAssignment>('SectionAssignment', SectionAssignmentSchema)
