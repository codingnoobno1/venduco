import mongoose, { Schema, Document } from 'mongoose'

export interface ILabourTeam extends Document {
    name: string
    vendorId: string
    leaderId: mongoose.Types.ObjectId
    memberIds: mongoose.Types.ObjectId[]
    projectLocation?: string
    createdAt: Date
    updatedAt: Date
}

const LabourTeamSchema = new Schema<ILabourTeam>(
    {
        name: { type: String, required: true },
        vendorId: { type: String, required: true },
        leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        projectLocation: { type: String }
    },
    { timestamps: true }
)

export const LabourTeam = mongoose.models.LabourTeam || mongoose.model<ILabourTeam>('LabourTeam', LabourTeamSchema)
