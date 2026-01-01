import mongoose, { Schema, Document } from 'mongoose';

export enum TaskDepartment {
    CEN = 'CEN', // Civil/General
    GEO = 'GEO', // Geotechnical
    TRK = 'TRK', // Track
    SIG = 'SIG', // Signaling
    ELE = 'ELE', // Electrical
}

export enum EngineeringTaskStatus {
    PLANNED = 'PLANNED',
    ACTIVE = 'ACTIVE',
    INSPECTION = 'INSPECTION',
    COMPLETED = 'COMPLETED',
    REWORK = 'REWORK'
}

export interface IEngineeringTask extends Document {
    projectId: mongoose.Types.ObjectId;
    sectionId: mongoose.Types.ObjectId;
    contractId: mongoose.Types.ObjectId;
    department: TaskDepartment;
    taskCode: string; // e.g., PILE_BORING, REBAR_FIXING
    boqItemId?: mongoose.Types.ObjectId;
    plannedQuantity: number;
    unit: string;
    plannedStart?: Date;
    plannedEnd?: Date;
    actualStart?: Date;
    actualEnd?: Date;
    status: EngineeringTaskStatus;
    dependsOn: mongoose.Types.ObjectId[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const EngineeringTaskSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection', required: true },
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    department: { type: String, enum: Object.values(TaskDepartment), required: true },
    taskCode: { type: String, required: true },
    boqItemId: { type: Schema.Types.ObjectId, ref: 'BOQItem' },
    plannedQuantity: { type: Number, required: true },
    unit: { type: String, required: true },
    plannedStart: { type: Date },
    plannedEnd: { type: Date },
    actualStart: { type: Date },
    actualEnd: { type: Date },
    status: { type: String, enum: Object.values(EngineeringTaskStatus), default: EngineeringTaskStatus.PLANNED },
    dependsOn: [{ type: Schema.Types.ObjectId, ref: 'EngineeringTask' }],
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} }
}, {
    timestamps: true,
});

// Ensure taskCode is unique within a section/contract for clarity
EngineeringTaskSchema.index({ sectionId: 1, contractId: 1, taskCode: 1 }, { unique: true });

export const EngineeringTask = mongoose.models.EngineeringTask || mongoose.model<IEngineeringTask>('EngineeringTask', EngineeringTaskSchema);
