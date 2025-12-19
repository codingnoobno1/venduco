// Location Model - GPS coordinates log
import mongoose, { Schema, Document } from 'mongoose'

export enum EntityType {
    MACHINE = 'MACHINE',
    VEHICLE = 'VEHICLE',
    USER = 'USER',
}

export interface ILocation extends Document {
    entityType: EntityType
    entityId: string
    entityCode?: string
    lat: number
    lng: number
    accuracy?: number
    altitude?: number
    speed?: number
    heading?: number
    batteryLevel?: number
    projectId?: string
    timestamp: Date
    createdAt: Date
}

const LocationSchema = new Schema<ILocation>(
    {
        entityType: {
            type: String,
            enum: Object.values(EntityType),
            required: true,
        },
        entityId: { type: String, required: true, index: true },
        entityCode: { type: String },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        accuracy: { type: Number },
        altitude: { type: Number },
        speed: { type: Number },
        heading: { type: Number },
        batteryLevel: { type: Number },
        projectId: { type: String, index: true },
        timestamp: { type: Date, required: true },
    },
    { timestamps: true }
)

// Compound indexes for efficient queries
LocationSchema.index({ entityType: 1, entityId: 1, timestamp: -1 })
LocationSchema.index({ projectId: 1, timestamp: -1 })

// TTL index - auto-delete locations older than 30 days
LocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 })

export const Location = mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema)
