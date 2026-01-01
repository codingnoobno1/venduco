import mongoose, { Schema, Document } from 'mongoose'

export enum EmploymentType {
    PERMANENT = 'PERMANENT',
    CONTRACT = 'CONTRACT',
    FREELANCE = 'FREELANCE'
}

export interface IOrganizationAffiliation extends Document {
    userId: string              // Supervisor or Worker
    userName: string
    vendorId: string            // Parent company
    vendorName: string
    employmentType: EmploymentType
    designation: string         // e.g., "Site Supervisor", "Senior Engineer"
    joinedAt: Date
    contractEndDate?: Date      // For contract workers
    isActive: boolean
}

const OrganizationAffiliationSchema = new Schema<IOrganizationAffiliation>(
    {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        vendorId: { type: String, required: true, index: true },
        vendorName: { type: String, required: true },
        employmentType: {
            type: String,
            enum: Object.values(EmploymentType),
            default: EmploymentType.CONTRACT
        },
        designation: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
        contractEndDate: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

// Unique: one user can only be affiliated with one vendor at a time
OrganizationAffiliationSchema.index({ userId: 1 }, { unique: true })

export const OrganizationAffiliation = mongoose.models.OrganizationAffiliation ||
    mongoose.model<IOrganizationAffiliation>('OrganizationAffiliation', OrganizationAffiliationSchema)
