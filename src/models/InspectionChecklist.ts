import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistItem {
    label: string;
    isPassed: boolean;
    remarks?: string;
    photo?: string;
}

export interface IInspectionChecklist extends Document {
    inspectionId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    inspectionType: 'STRUCTURAL' | 'MATERIAL' | 'SAFETY' | 'ELECTRICAL' | 'SIGNALING';
    items: IChecklistItem[];
    createdAt: Date;
    updatedAt: Date;
}

const InspectionChecklistSchema: Schema = new Schema({
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'EngineeringTask', required: true },
    inspectionType: { type: String, required: true },
    items: [{
        label: { type: String, required: true },
        isPassed: { type: Boolean, required: true },
        remarks: { type: String },
        photo: { type: String }
    }]
}, {
    timestamps: true,
});

export const InspectionChecklist = mongoose.models.InspectionChecklist || mongoose.model<IInspectionChecklist>('InspectionChecklist', InspectionChecklistSchema);
