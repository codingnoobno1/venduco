import mongoose, { Schema, Document } from 'mongoose';

export enum NCRSeverity {
    MINOR = 'MINOR',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL'
}

export enum NCRType {
    QUALITY = 'QUALITY',
    SAFETY = 'SAFETY',
    DESIGN = 'DESIGN'
}

export enum NCRStatus {
    OPEN = 'OPEN',
    RESOLUTION_SUBMITTED = 'RESOLUTION_SUBMITTED',
    CLOSED = 'CLOSED'
}

export interface INCR extends Document {
    taskId?: mongoose.Types.ObjectId;
    sectionId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    contractId: mongoose.Types.ObjectId;
    issueType: NCRType;
    severity: NCRSeverity;
    description: string;
    correctiveAction?: string;
    raisedBy: mongoose.Types.ObjectId; // User (Inspector)
    status: NCRStatus;
    evidencePhotos: string[];
    closureDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const NCRSchema: Schema = new Schema({
    taskId: { type: Schema.Types.ObjectId, ref: 'EngineeringTask' },
    sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    issueType: { type: String, enum: Object.values(NCRType), required: true },
    severity: { type: String, enum: Object.values(NCRSeverity), required: true },
    description: { type: String, required: true },
    correctiveAction: { type: String },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(NCRStatus), default: NCRStatus.OPEN },
    evidencePhotos: [{ type: String }],
    closureDate: { type: Date }
}, {
    timestamps: true,
});

export const NCR = mongoose.models.NCR || mongoose.model<INCR>('NCR', NCRSchema);
