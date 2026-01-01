import mongoose, { Schema, Document } from 'mongoose';

export enum VOStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface IVariationOrder extends Document {
    projectId: mongoose.Types.ObjectId;
    contractId: mongoose.Types.ObjectId;
    sectionId: mongoose.Types.ObjectId;
    taskCode: string;
    addedQuantity: number;
    newRate?: number;
    reason: string;
    status: VOStatus;
    approvedBy?: mongoose.Types.ObjectId;
    approvalDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const VariationOrderSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection', required: true },
    taskCode: { type: String, required: true },
    addedQuantity: { type: Number, required: true },
    newRate: { type: Number },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(VOStatus), default: VOStatus.PENDING },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalDate: { type: Date }
}, {
    timestamps: true,
});

export const VariationOrder = mongoose.models.VariationOrder || mongoose.model<IVariationOrder>('VariationOrder', VariationOrderSchema);
