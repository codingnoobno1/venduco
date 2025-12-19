// AuditLog Model - Record user actions and API changes
import mongoose, { Schema, Document } from 'mongoose'

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    VIEW = 'VIEW',
    EXPORT = 'EXPORT',
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
    ASSIGN = 'ASSIGN',
    UPLOAD = 'UPLOAD',
}

export interface IAuditLog extends Document {
    userId: string
    userName: string
    userRole?: string
    action: AuditAction
    entityType: string
    entityId?: string
    entityName?: string
    description: string
    changes?: {
        before?: any
        after?: any
        fields?: string[]
    }
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, any>
    timestamp: Date
    createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        userId: { type: String, required: true, index: true },
        userName: { type: String, required: true },
        userRole: { type: String },
        action: {
            type: String,
            enum: Object.values(AuditAction),
            required: true,
        },
        entityType: { type: String, required: true, index: true },
        entityId: { type: String, index: true },
        entityName: { type: String },
        description: { type: String, required: true },
        changes: {
            before: Schema.Types.Mixed,
            after: Schema.Types.Mixed,
            fields: [String],
        },
        ipAddress: { type: String },
        userAgent: { type: String },
        metadata: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

AuditLogSchema.index({ userId: 1, timestamp: -1 })
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 })
AuditLogSchema.index({ action: 1, timestamp: -1 })
// TTL - keep audit logs for 1 year
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 })

export const AuditLog = mongoose.models.AuditLog ||
    mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
