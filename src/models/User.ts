// User Model - Extended for Multi-Step Registration
import mongoose, { Schema, Document } from 'mongoose'

// Registration status enum
export enum RegistrationStatus {
    PENDING_PROFILE = 'PENDING_PROFILE',
    ROLE_DECLARED = 'ROLE_DECLARED',
    DETAILS_COMPLETED = 'DETAILS_COMPLETED',
    UNDER_VERIFICATION = 'UNDER_VERIFICATION',
    ACTIVE = 'ACTIVE',
    REJECTED = 'REJECTED',
}

// User roles enum
export enum UserRole {
    VENDOR = 'VENDOR',
    PROJECT_MANAGER = 'PROJECT_MANAGER',
    SUPERVISOR = 'SUPERVISOR',
    COMPANY_REP = 'COMPANY_REP',
    ADMIN = 'ADMIN',
}

export interface IUser extends Document {
    // Basic Account (Step 1)
    email: string
    passwordHash: string
    name: string
    phone?: string
    avatar?: string
    emailVerified: boolean
    isActive: boolean

    // Registration Flow
    registrationStep: number
    registrationStatus: RegistrationStatus

    // Profile Setup (Step 2)
    city?: string
    state?: string
    preferredLanguage?: string
    requestedRole?: UserRole
    operatingRegions?: string[]

    // Vendor Details (Step 3 - VENDOR)
    businessType?: string
    businessName?: string
    yearsOfOperation?: number
    serviceCategories?: string[]
    gstNumber?: string
    panNumber?: string
    bankAccountNumber?: string
    ifscCode?: string
    bankAccountName?: string

    // PM Details (Step 3 - PROJECT_MANAGER)
    employmentType?: string
    currentOrganization?: string
    yearsOfExperience?: number
    pastProjects?: string
    certifications?: string
    declarationAccepted?: boolean

    // Supervisor Details (Step 3 - SUPERVISOR)
    siteExperience?: number
    skillCategories?: string[]
    workingUnderType?: string
    workingUnderName?: string

    // Verification
    submittedAt?: Date
    verifiedBy?: string
    verifiedAt?: Date
    rejectionReason?: string

    // Timestamps
    createdAt: Date
    updatedAt: Date
    lastLoginAt?: Date
}

const UserSchema = new Schema<IUser>(
    {
        // Basic Account
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: { type: String, trim: true },
        avatar: { type: String },
        emailVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },

        // Registration Flow
        registrationStep: { type: Number, default: 1 },
        registrationStatus: {
            type: String,
            enum: Object.values(RegistrationStatus),
            default: RegistrationStatus.PENDING_PROFILE,
        },

        // Profile Setup
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        preferredLanguage: { type: String, default: 'en' },
        requestedRole: {
            type: String,
            enum: Object.values(UserRole),
        },
        operatingRegions: [{ type: String }],

        // Vendor Details
        businessType: { type: String },
        businessName: { type: String, trim: true },
        yearsOfOperation: { type: Number },
        serviceCategories: [{ type: String }],
        gstNumber: { type: String, trim: true },
        panNumber: { type: String, trim: true },
        bankAccountNumber: { type: String },
        ifscCode: { type: String, trim: true },
        bankAccountName: { type: String, trim: true },

        // PM Details
        employmentType: { type: String },
        currentOrganization: { type: String, trim: true },
        yearsOfExperience: { type: Number },
        pastProjects: { type: String },
        certifications: { type: String },
        declarationAccepted: { type: Boolean },

        // Supervisor Details
        siteExperience: { type: Number },
        skillCategories: [{ type: String }],
        workingUnderType: { type: String },
        workingUnderName: { type: String, trim: true },

        // Verification
        submittedAt: { type: Date },
        verifiedBy: { type: String },
        verifiedAt: { type: Date },
        rejectionReason: { type: String },

        lastLoginAt: { type: Date },
    },
    {
        timestamps: true,
    }
)

// Indexes
UserSchema.index({ registrationStatus: 1 })
UserSchema.index({ requestedRole: 1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
