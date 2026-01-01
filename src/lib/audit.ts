import { AuditLog, AuditAction } from '@/models'
import mongoose from 'mongoose'

interface AuditParams {
    userId: string;
    action: AuditAction | string;
    entityType: string;
    entityId: string | mongoose.Types.ObjectId;
    oldValue?: any;
    newValue?: any;
    metadata?: Record<string, any>;
    ipAddress?: string;
}

/**
 * Log a governance action to the Audit trail
 */
export async function logAction({
    userId,
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    metadata,
    ipAddress
}: AuditParams) {
    try {
        await AuditLog.create({
            userId,
            action,
            entityType,
            entityId,
            oldValue,
            newValue,
            metadata,
            ipAddress
        });
    } catch (error) {
        console.error('Audit Log Sync Failure:', error);
        // Note: In some systems, we might want to throw if audit fails to maintain compliance,
        // but here we just log the failure to prevent crashing the main flow.
    }
}
