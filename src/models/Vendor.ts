// Vendor Model - Mongoose Schema
import mongoose, { Schema, Document } from 'mongoose'

export interface IVendor extends Document {
    projectId: string
    userId: string
    companyName?: string
    specialty: string
    tasksCompleted: number
    averageRating: number
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
}

const VendorSchema = new Schema<IVendor>(
    {
        projectId: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
        },
        companyName: {
            type: String,
            trim: true,
        },
        specialty: {
            type: String,
            required: true,
            trim: true,
        },
        tasksCompleted: {
            type: Number,
            default: 0,
            min: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
VendorSchema.index({ projectId: 1, isAvailable: 1 })
VendorSchema.index({ userId: 1 })

export const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema)
