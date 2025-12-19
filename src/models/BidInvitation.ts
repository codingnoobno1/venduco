// BidInvitation Model - Track vendor invitations to bid on projects
import mongoose, { Schema, Document } from 'mongoose'

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export interface IBidInvitation extends Document {
    projectId: string
    projectName: string
    projectCode: string

    // Vendor Info
    vendorId: string
    vendorName: string
    vendorEmail: string
    vendorPhone?: string

    // Invitation Details
    invitedBy: string
    invitedByName: string
    invitedAt: Date
    message?: string

    // Status Tracking
    status: InvitationStatus
    respondedAt?: Date
    responseNotes?: string

    // Validity
    expiresAt?: Date

    // Related Bid (if accepted and submitted)
    bidId?: string

    createdAt: Date
    updatedAt: Date
}

const BidInvitationSchema = new Schema<IBidInvitation>(
    {
        projectId: { type: String, required: true, index: true },
        projectName: { type: String, required: true },
        projectCode: { type: String, required: true },

        vendorId: { type: String, required: true, index: true },
        vendorName: { type: String, required: true },
        vendorEmail: { type: String, required: true },
        vendorPhone: { type: String },

        invitedBy: { type: String, required: true },
        invitedByName: { type: String, required: true },
        invitedAt: { type: Date, default: Date.now },
        message: { type: String },

        status: {
            type: String,
            enum: Object.values(InvitationStatus),
            default: InvitationStatus.PENDING,
        },
        respondedAt: { type: Date },
        responseNotes: { type: String },

        expiresAt: { type: Date },
        bidId: { type: String },
    },
    { timestamps: true }
)

// Indexes
BidInvitationSchema.index({ projectId: 1, vendorId: 1 }, { unique: true })
BidInvitationSchema.index({ vendorId: 1, status: 1 })
BidInvitationSchema.index({ expiresAt: 1 })

export const BidInvitation = mongoose.models.BidInvitation ||
    mongoose.model<IBidInvitation>('BidInvitation', BidInvitationSchema)
