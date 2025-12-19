// GeoFence Model - Site boundaries for alerts
import mongoose, { Schema, Document } from 'mongoose'

export enum GeoFenceType {
    PROJECT_SITE = 'PROJECT_SITE',
    RESTRICTED_ZONE = 'RESTRICTED_ZONE',
    PARKING_AREA = 'PARKING_AREA',
    STORAGE_ZONE = 'STORAGE_ZONE',
    SAFETY_ZONE = 'SAFETY_ZONE',
}

export enum GeoFenceShape {
    CIRCLE = 'CIRCLE',
    POLYGON = 'POLYGON',
    RECTANGLE = 'RECTANGLE',
}

export interface IGeoFence extends Document {
    projectId: string
    name: string
    type: GeoFenceType
    shape: GeoFenceShape
    // For circles
    center?: {
        lat: number
        lng: number
    }
    radius?: number // meters
    // For polygons/rectangles
    coordinates?: Array<{
        lat: number
        lng: number
    }>
    alertOnEntry: boolean
    alertOnExit: boolean
    alertToUsers?: string[] // User IDs to notify
    isActive: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date
}

const GeoFenceSchema = new Schema<IGeoFence>(
    {
        projectId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: Object.values(GeoFenceType),
            required: true,
        },
        shape: {
            type: String,
            enum: Object.values(GeoFenceShape),
            required: true,
        },
        center: {
            lat: Number,
            lng: Number,
        },
        radius: { type: Number },
        coordinates: [{
            lat: Number,
            lng: Number,
        }],
        alertOnEntry: { type: Boolean, default: true },
        alertOnExit: { type: Boolean, default: true },
        alertToUsers: [{ type: String }],
        isActive: { type: Boolean, default: true },
        createdBy: { type: String, required: true },
    },
    { timestamps: true }
)

GeoFenceSchema.index({ projectId: 1, isActive: 1 })

export const GeoFence = mongoose.models.GeoFence ||
    mongoose.model<IGeoFence>('GeoFence', GeoFenceSchema)
