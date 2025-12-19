// Notification Model - Push / in-app notifications
import mongoose, { Schema, Document } from 'mongoose'

export enum NotificationType {
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    REPORT_SUBMITTED = 'REPORT_SUBMITTED',
    REPORT_APPROVED = 'REPORT_APPROVED',
    REPORT_REJECTED = 'REPORT_REJECTED',
    MACHINE_ASSIGNED = 'MACHINE_ASSIGNED',
    MAINTENANCE_DUE = 'MAINTENANCE_DUE',
    GEOFENCE_ALERT = 'GEOFENCE_ALERT',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    REGISTRATION_APPROVED = 'REGISTRATION_APPROVED',
    REGISTRATION_REJECTED = 'REGISTRATION_REJECTED',
    SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export interface INotification extends Document {
    userId: string
    type: NotificationType
    title: string
    message: string
    priority: NotificationPriority
    data?: {
        entityType?: string
        entityId?: string
        actionUrl?: string
        [key: string]: any
    }
    isRead: boolean
    readAt?: Date
    isPushed: boolean
    pushedAt?: Date
    expiresAt?: Date
    createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: String, required: true, index: true },
        type: {
            type: String,
            enum: Object.values(NotificationType),
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        priority: {
            type: String,
            enum: Object.values(NotificationPriority),
            default: NotificationPriority.NORMAL,
        },
        data: { type: Schema.Types.Mixed },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
        isPushed: { type: Boolean, default: false },
        pushedAt: { type: Date },
        expiresAt: { type: Date },
    },
    { timestamps: true }
)

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, createdAt: -1 })
// TTL - auto delete after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

export const Notification = mongoose.models.Notification ||
    mongoose.model<INotification>('Notification', NotificationSchema)
