import mongoose, { Schema, Document } from 'mongoose'

export interface IProjectOutcomeReview extends Document {
    projectId: string
    vendorId: string
    successRating: number // 1-10
    totalDelays: number   // Days
    ncrCount: number
    strategiesUsed: string[]
    bestPerformingStrategies: string[]
    failedStrategies: string[]
    lessonsLearned: string
    isFinalized: boolean
}

const ProjectOutcomeReviewSchema = new Schema<IProjectOutcomeReview>(
    {
        projectId: { type: String, required: true, index: true },
        vendorId: { type: String, required: true, index: true },
        successRating: { type: Number, min: 1, max: 10, required: true },
        totalDelays: { type: Number, default: 0 },
        ncrCount: { type: Number, default: 0 },
        strategiesUsed: [{ type: String }],
        bestPerformingStrategies: [{ type: String }],
        failedStrategies: [{ type: String }],
        lessonsLearned: { type: String },
        isFinalized: { type: Boolean, default: false },
    },
    { timestamps: true }
)

export const ProjectOutcomeReview = mongoose.models.ProjectOutcomeReview ||
    mongoose.model<IProjectOutcomeReview>('ProjectOutcomeReview', ProjectOutcomeReviewSchema)
