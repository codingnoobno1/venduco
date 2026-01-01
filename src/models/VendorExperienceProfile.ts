import mongoose, { Schema, Document } from 'mongoose'

export enum ExperienceLevel {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

export interface IVendorSpecialisation {
    workCode: string // Linked to SpecialisedWork.code
    experienceLevel: ExperienceLevel
    evidenceProjects: {
        projectName: string
        client: string
        year: number
        value: number
        description?: string
    }[]
}

export interface IVendorExperienceProfile extends Document {
    vendorId: string
    coreDomains: string[]       // e.g. ['ROADS', 'METRO', 'TUNNEL']
    terrainExperience: string[] // e.g. ['HARD_ROCK', 'URBAN_CONGESTED']
    specialisations: IVendorSpecialisation[]
    equipmentStrength: {
        type: string
        quantity: number
        condition: 'NEW' | 'GOOD' | 'FAIR'
    }[]
    certifications: string[]
    yearsOfExperience: number
    overallRating: number
}

const VendorExperienceProfileSchema = new Schema<IVendorExperienceProfile>(
    {
        vendorId: { type: String, required: true, unique: true, index: true },
        coreDomains: [{ type: String }],
        terrainExperience: [{ type: String }],
        specialisations: [{
            workCode: { type: String, required: true },
            experienceLevel: {
                type: String,
                enum: Object.values(ExperienceLevel),
                default: ExperienceLevel.BASIC
            },
            evidenceProjects: [{
                projectName: { type: String, required: true },
                client: { type: String, required: true },
                year: { type: Number },
                value: { type: Number },
                description: { type: String }
            }]
        }],
        equipmentStrength: [{
            type: { type: String, required: true },
            quantity: { type: Number, required: true },
            condition: { type: String, enum: ['NEW', 'GOOD', 'FAIR'], default: 'GOOD' }
        }],
        certifications: [{ type: String }],
        yearsOfExperience: { type: Number, default: 0 },
        overallRating: { type: Number, default: 0 },
    },
    { timestamps: true }
)

export const VendorExperienceProfile = mongoose.models.VendorExperienceProfile ||
    mongoose.model<IVendorExperienceProfile>('VendorExperienceProfile', VendorExperienceProfileSchema)
