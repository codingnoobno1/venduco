import mongoose, { Schema, Document } from 'mongoose';

export enum DelayReason {
    WEATHER = 'WEATHER',
    LAND_ACQUISITION = 'LAND_ACQUISITION',
    DESIGN_CHANGE = 'DESIGN_CHANGE',
    VENDOR_DEFAULT = 'VENDOR_DEFAULT',
    FORCE_MAJEURE = 'FORCE_MAJEURE',
    EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE'
}

export interface IDelayEvent extends Document {
    projectId: mongoose.Types.ObjectId;
    sectionId?: mongoose.Types.ObjectId;
    taskId?: mongoose.Types.ObjectId;
    reason: DelayReason;
    daysLost: number;
    responsibleParty?: string;
    description: string;
    evidenceDocs: string[];
    createdAt: Date;
    updatedAt: Date;
}

const DelayEventSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection' },
    taskId: { type: Schema.Types.ObjectId, ref: 'EngineeringTask' },
    reason: { type: String, enum: Object.values(DelayReason), required: true },
    daysLost: { type: Number, required: true },
    responsibleParty: { type: String },
    description: { type: String, required: true },
    evidenceDocs: [{ type: String }]
}, {
    timestamps: true,
});

export const DelayEvent = mongoose.models.DelayEvent || mongoose.model<IDelayEvent>('DelayEvent', DelayEventSchema);
