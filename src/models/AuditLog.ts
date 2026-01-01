import mongoose, { Schema, Document } from 'mongoose';

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
    SUBMIT = 'SUBMIT'
}

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string; // e.g., UPDATE_PROGRESS, APPROVE_INVOICE, RAISE_NCR
    entityType: string; // e.g., 'Invoice', 'SectionProgress'
    entityId: mongoose.Types.ObjectId;
    oldValue?: any;
    newValue?: any;
    metadata?: Record<string, any>;
    ipAddress?: string;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    metadata: { type: Map, of: Schema.Types.Mixed },
    ipAddress: { type: String }
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

// Optimized for time-based audit forensics
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entityId: 1, entityType: 1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
