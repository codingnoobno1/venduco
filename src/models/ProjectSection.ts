import mongoose, { Schema, Document } from 'mongoose'

export enum SectionStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export interface IProjectSection extends Document {
    projectId: mongoose.Types.ObjectId | string
    sectionCode: string
    fromKm: number
    toKm: number
    lengthKm: number
    status: SectionStatus
    description?: string
    createdAt: Date
    updatedAt: Date
}

const ProjectSectionSchema = new Schema<IProjectSection>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        sectionCode: { type: String, required: true, trim: true },
        fromKm: { type: Number, required: true },
        toKm: { type: Number, required: true },
        lengthKm: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(SectionStatus),
            default: SectionStatus.NOT_STARTED,
        },
        description: { type: String },
    },
    { timestamps: true }
)

ProjectSectionSchema.index({ projectId: 1, sectionCode: 1 }, { unique: true })
ProjectSectionSchema.index({ fromKm: 1, toKm: 1 })

export const ProjectSection = mongoose.models.ProjectSection || mongoose.model<IProjectSection>('ProjectSection', ProjectSectionSchema)
