import mongoose, { Schema, Document } from 'mongoose'

export interface IProjectTeam extends Document {
    projectId: string
    teamName: string
    supervisorId: string        // Lead supervisor
    supervisorName: string
    vendorId?: string           // If team is under a vendor
    members: {
        userId: string
        userName: string
        role: string            // e.g., "Mason", "Welder", "Helper"
        dailyRate?: number
    }[]
    assignedSections: string[]  // Section IDs this team works on
    assignedTasks: string[]     // Task IDs
    isActive: boolean
}

const ProjectTeamSchema = new Schema<IProjectTeam>(
    {
        projectId: { type: String, required: true, index: true },
        teamName: { type: String, required: true },
        supervisorId: { type: String, required: true, index: true },
        supervisorName: { type: String, required: true },
        vendorId: { type: String, index: true },
        members: [{
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            role: { type: String, required: true },
            dailyRate: { type: Number }
        }],
        assignedSections: [{ type: String }],
        assignedTasks: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

export const ProjectTeam = mongoose.models.ProjectTeam ||
    mongoose.model<IProjectTeam>('ProjectTeam', ProjectTeamSchema)
