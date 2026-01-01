import mongoose, { Schema, Document } from 'mongoose'

export interface IExperience {
    company: string
    position: string
    location: string
    startDate: Date
    endDate?: Date
    isCurrent: boolean
    responsibilities: string[]
    projectValue?: number
}

export interface ICertificate {
    name: string
    issuer: string
    issueDate: Date
    expiryDate?: Date
    certificateNumber: string
    documentUrl?: string
    verified: boolean
}

export interface IAuthorization {
    type: string              // e.g., 'SIGNING_AUTHORITY', 'TECHNICAL_APPROVAL', 'SAFETY_CLEARANCE'
    scope: string             // e.g., 'Up to ₹50L', 'Tunnel Works', 'Confined Spaces'
    grantedBy: string
    grantedDate: Date
    expiryDate?: Date
    isActive: boolean
}

export interface IProjectHistory {
    projectName: string
    client: string
    role: string
    projectType: string       // e.g., 'METRO', 'HIGHWAY', 'BRIDGE'
    value: number
    duration: number          // months
    startDate: Date
    endDate: Date
    outcome: 'COMPLETED' | 'ONGOING' | 'TERMINATED'
    delaysInDays: number
    ncrCount: number
    successRating: number     // 1-10
    description?: string
}

export interface IUserProfile extends Document {
    userId: string
    role: string              // PM, SUPERVISOR, INSPECTOR, VENDOR

    // Professional Summary
    headline: string          // e.g., "Senior Tunnel Engineer with 15 years"
    bio: string
    yearsOfExperience: number

    // Experience History
    experience: IExperience[]

    // Certifications (quick reference, detailed ones in Certificate model)
    certificationSummary: {
        name: string
        issuer: string
        expiryDate?: Date
    }[]

    // Authorizations & Powers
    authorizations: IAuthorization[]

    // Project History
    projectHistory: IProjectHistory[]

    // Performance Metrics
    performance: {
        totalProjectsCompleted: number
        totalProjectValue: number
        bidsWon: number
        bidsTotal: number
        averageSuccessRating: number
        totalNCRs: number
        criticalNCRs: number
    }

    // Profile Completeness
    completionPercentage: number
    lastUpdated: Date
}

const UserProfileSchema = new Schema<IUserProfile>(
    {
        userId: { type: String, required: true, unique: true },
        role: { type: String, required: false },

        headline: { type: String, default: '' },
        bio: { type: String, default: '' },
        yearsOfExperience: { type: Number, default: 0 },

        experience: [{
            company: { type: String, required: true },
            position: { type: String, required: true },
            location: { type: String },
            startDate: { type: Date, required: true },
            endDate: { type: Date },
            isCurrent: { type: Boolean, default: false },
            responsibilities: [{ type: String }],
            projectValue: { type: Number }
        }],

        certificationSummary: [{
            name: { type: String },
            issuer: { type: String },
            expiryDate: { type: Date }
        }],

        authorizations: [{
            type: { type: String, required: true },
            scope: { type: String, required: true },
            grantedBy: { type: String },
            grantedDate: { type: Date, default: Date.now },
            expiryDate: { type: Date },
            isActive: { type: Boolean, default: true }
        }],

        projectHistory: [{
            projectName: { type: String, required: true },
            client: { type: String, required: true },
            role: { type: String, required: true },
            projectType: { type: String },
            value: { type: Number, required: true },
            duration: { type: Number },
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            outcome: { type: String, enum: ['COMPLETED', 'ONGOING', 'TERMINATED'], default: 'COMPLETED' },
            delaysInDays: { type: Number, default: 0 },
            ncrCount: { type: Number, default: 0 },
            successRating: { type: Number, min: 1, max: 10 },
            description: { type: String }
        }],

        performance: {
            totalProjectsCompleted: { type: Number, default: 0 },
            totalProjectValue: { type: Number, default: 0 },
            bidsWon: { type: Number, default: 0 },
            bidsTotal: { type: Number, default: 0 },
            averageSuccessRating: { type: Number, default: 0 },
            totalNCRs: { type: Number, default: 0 },
            criticalNCRs: { type: Number, default: 0 }
        },

        completionPercentage: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

export const UserProfile = mongoose.models.UserProfile ||
    mongoose.model<IUserProfile>('UserProfile', UserProfileSchema)
