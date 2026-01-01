import mongoose, { Schema, Document } from 'mongoose'

export enum UnitType {
    EXECUTION = 'EXECUTION',
    QUALITY = 'QUALITY',
    SAFETY = 'SAFETY',
    DESIGN = 'DESIGN',
    PLANNING = 'PLANNING',
    STRATEGY = 'STRATEGY'
}

export interface ICollaborationUnit extends Document {
    projectId: string
    unitType: UnitType
    name: string
    leadUserId: string      // Usually a Manager or Senior Engineer
    members: {
        userId: string
        role: string        // Contextual role within unit
    }[]
    scope: {
        sectionIds: string[]
        taskIds: string[]
    }
    description?: string
}

const CollaborationUnitSchema = new Schema<ICollaborationUnit>(
    {
        projectId: { type: String, required: true, index: true },
        unitType: {
            type: String,
            enum: Object.values(UnitType),
            required: true
        },
        name: { type: String, required: true },
        leadUserId: { type: String, required: true },
        members: [{
            userId: { type: String, required: true },
            role: { type: String, required: true }
        }],
        scope: {
            sectionIds: [{ type: String }],
            taskIds: [{ type: String }]
        },
        description: { type: String },
    },
    { timestamps: true }
)

export const CollaborationUnit = mongoose.models.CollaborationUnit ||
    mongoose.model<ICollaborationUnit>('CollaborationUnit', CollaborationUnitSchema)
