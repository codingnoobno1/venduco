// Bid Model - Project bidding by vendors/supervisors
import mongoose, { Schema, Document } from 'mongoose'

export enum BidStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
}

export enum BidderType {
    VENDOR = 'VENDOR',
    SUPERVISOR = 'SUPERVISOR',
    COMPANY = 'COMPANY',
}

export interface IBid extends Document {
    projectId: string
    projectName: string

    // Bidder Info
    bidderId: string
    bidderType: BidderType
    bidderName: string
    bidderEmail: string
    bidderPhone?: string
    companyName?: string

    // Bid Details
    proposedAmount: number
    currency: string
    timeline: {
        startDate?: Date
        endDate?: Date
        durationDays?: number
    }

    // Resources Offered
    machinesOffered?: Array<{
        machineId?: string
        machineType: string
        quantity: number
        dailyRate?: number
    }>
    manpowerOffered?: number

    // Proposal
    proposal?: string
    attachments?: string[]

    // Experience & Qualifications
    relevantExperience?: string
    pastProjects?: string[]
    certifications?: string[]

    // Status & Review
    status: BidStatus
    submittedAt?: Date
    reviewedBy?: string
    reviewedAt?: Date
    reviewNotes?: string
    rejectionReason?: string

    // Contact visibility (shown when approved/hired)
    contactVisible: boolean

    createdAt: Date
    updatedAt: Date
}

const BidSchema = new Schema<IBid>(
    {
        projectId: { type: String, required: true, index: true },
        projectName: { type: String, required: true },

        // Bidder
        bidderId: { type: String, required: true, index: true },
        bidderType: {
            type: String,
            enum: Object.values(BidderType),
            required: true,
        },
        bidderName: { type: String, required: true },
        bidderEmail: { type: String, required: true },
        bidderPhone: { type: String },
        companyName: { type: String },

        // Bid Details
        proposedAmount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'INR' },
        timeline: {
            startDate: Date,
            endDate: Date,
            durationDays: Number,
        },

        // Resources
        machinesOffered: [{
            machineId: String,
            machineType: String,
            quantity: Number,
            dailyRate: Number,
        }],
        manpowerOffered: { type: Number },

        // Proposal
        proposal: { type: String },
        attachments: [{ type: String }],

        // Experience
        relevantExperience: { type: String },
        pastProjects: [{ type: String }],
        certifications: [{ type: String }],

        // Status
        status: {
            type: String,
            enum: Object.values(BidStatus),
            default: BidStatus.DRAFT,
        },
        submittedAt: { type: Date },
        reviewedBy: { type: String },
        reviewedAt: { type: Date },
        reviewNotes: { type: String },
        rejectionReason: { type: String },

        // Contact visible only when hired/approved
        contactVisible: { type: Boolean, default: false },
    },
    { timestamps: true }
)

// Indexes
BidSchema.index({ projectId: 1, status: 1 })
BidSchema.index({ bidderId: 1, status: 1 })
BidSchema.index({ projectId: 1, bidderId: 1 }, { unique: true }) // One bid per bidder per project

export const Bid = mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema)
