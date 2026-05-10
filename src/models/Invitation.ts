import mongoose, { Schema, Document } from 'mongoose'

export interface IInvitation extends Document {
    vendorId: mongoose.Types.ObjectId
    workerId: mongoose.Types.ObjectId
    jobId?: mongoose.Types.ObjectId
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
    message?: string
    createdAt: Date
    updatedAt: Date
}

const InvitationSchema = new Schema<IInvitation>(
    {
        vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'LabourJob' },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
            default: 'PENDING'
        },
        message: { type: String }
    },
    { timestamps: true }
)

export const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema)
