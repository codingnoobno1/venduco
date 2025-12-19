// ProjectCollaborator Model - PM collaboration with roles and permissions
import mongoose, { Schema, Document } from 'mongoose'

export enum CollaboratorRole {
    ADMIN_PM = 'ADMIN_PM',           // Creator - full control
    COLLABORATOR_PM = 'COLLABORATOR_PM',  // Invited - limited permissions
}

export enum CollaboratorStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    REMOVED = 'REMOVED',
}

export interface IProjectCollaborator extends Document {
    projectId: string
    projectName: string

    // Collaborator Info
    userId: string
    userName: string
    userEmail: string

    // Role & Permissions
    role: CollaboratorRole
    permissions: string[]

    // Invitation Details
    invitedBy: string
    invitedByName: string
    invitedAt: Date
    inviteMessage?: string

    // Status
    status: CollaboratorStatus
    acceptedAt?: Date
    declineReason?: string

    // Suggestions (collaborators can suggest other PMs)
    suggestedBy?: string
    suggestedByName?: string

    createdAt: Date
    updatedAt: Date
}

// Available permissions for collaborators
export const COLLABORATOR_PERMISSIONS = {
    VIEW_PROJECT: 'view_project',
    EDIT_PROJECT: 'edit_project',
    MANAGE_BIDS: 'manage_bids',
    INVITE_VENDORS: 'invite_vendors',
    MANAGE_TEAM: 'manage_team',
    VIEW_COSTS: 'view_costs',
    APPROVE_REPORTS: 'approve_reports',
    SUGGEST_COLLABORATORS: 'suggest_collaborators',
}

// Default permissions for collaborator role
export const DEFAULT_COLLABORATOR_PERMISSIONS = [
    COLLABORATOR_PERMISSIONS.VIEW_PROJECT,
    COLLABORATOR_PERMISSIONS.VIEW_COSTS,
    COLLABORATOR_PERMISSIONS.SUGGEST_COLLABORATORS,
]

// Admin gets all permissions
export const ADMIN_PERMISSIONS = Object.values(COLLABORATOR_PERMISSIONS)

const ProjectCollaboratorSchema = new Schema<IProjectCollaborator>(
    {
        projectId: { type: String, required: true, index: true },
        projectName: { type: String, required: true },

        userId: { type: String, required: true, index: true },
        userName: { type: String, required: true },
        userEmail: { type: String, required: true },

        role: {
            type: String,
            enum: Object.values(CollaboratorRole),
            required: true,
        },
        permissions: [{ type: String }],

        invitedBy: { type: String, required: true },
        invitedByName: { type: String, required: true },
        invitedAt: { type: Date, default: Date.now },
        inviteMessage: { type: String },

        status: {
            type: String,
            enum: Object.values(CollaboratorStatus),
            default: CollaboratorStatus.PENDING,
        },
        acceptedAt: { type: Date },
        declineReason: { type: String },

        suggestedBy: { type: String },
        suggestedByName: { type: String },
    },
    { timestamps: true }
)

// Indexes
ProjectCollaboratorSchema.index({ projectId: 1, userId: 1 }, { unique: true })
ProjectCollaboratorSchema.index({ userId: 1, status: 1 })
ProjectCollaboratorSchema.index({ invitedBy: 1 })

export const ProjectCollaborator = mongoose.models.ProjectCollaborator ||
    mongoose.model<IProjectCollaborator>('ProjectCollaborator', ProjectCollaboratorSchema)
