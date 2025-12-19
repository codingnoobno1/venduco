// Announcement Model
import mongoose, { Schema, Document } from 'mongoose'

export enum AnnouncementScope {
    PROJECT = 'PROJECT',
    VENDOR = 'VENDOR',
    GLOBAL = 'GLOBAL',
}

export enum AnnouncementPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export interface IAnnouncement extends Document {
    scope: AnnouncementScope
    scopeId?: string
    title: string
    message: string
    priority: AnnouncementPriority
    createdBy: string
    createdByName: string
    expiresAt?: Date
    readBy?: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        scope: {
            type: String,
            enum: Object.values(AnnouncementScope),
            required: true,
        },
        scopeId: { type: String, index: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        priority: {
            type: String,
            enum: Object.values(AnnouncementPriority),
            default: AnnouncementPriority.NORMAL,
        },
        createdBy: { type: String, required: true },
        createdByName: { type: String, required: true },
        expiresAt: { type: Date },
        readBy: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

AnnouncementSchema.index({ scope: 1, scopeId: 1, createdAt: -1 })
AnnouncementSchema.index({ isActive: 1, expiresAt: 1 })

export const Announcement = mongoose.models.Announcement ||
    mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema)
