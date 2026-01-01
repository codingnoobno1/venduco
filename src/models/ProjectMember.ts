// Project Member Model - User-Project relationship
import mongoose, { Schema, Document } from 'mongoose'

export enum MemberRole {
    PROJECT_MANAGER = 'PROJECT_MANAGER',
    VENDOR = 'VENDOR',
    SUPERVISOR = 'SUPERVISOR',
    INSPECTOR = 'INSPECTOR',
    VIEWER = 'VIEWER',
}

export interface IProjectMember extends Document {
    projectId: string
    userId: string
    userName: string
    userEmail: string
    role: MemberRole
    addedBy: string
    addedAt: Date
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const ProjectMemberSchema = new Schema<IProjectMember>(
    {
        projectId: { type: String, required: true, index: true },
        userId: { type: String, required: true, index: true },
        userName: { type: String, required: true },
        userEmail: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(MemberRole),
            required: true,
        },
        addedBy: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

// Unique compound index - one user per project
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true })
ProjectMemberSchema.index({ userId: 1, isActive: 1 })

export const ProjectMember = mongoose.models.ProjectMember ||
    mongoose.model<IProjectMember>('ProjectMember', ProjectMemberSchema)
