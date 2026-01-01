import mongoose, { Schema, Document } from 'mongoose';

export interface IBOQItem extends Document {
    contractId: mongoose.Types.ObjectId;
    sectionId: mongoose.Types.ObjectId;
    taskCode: string; // Cross-reference to EngineeringTask.taskCode
    description: string;
    totalQuantity: number;
    consumedQuantity: number;
    unit: string;
    rate: number;
    totalAmount: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const BOQItemSchema: Schema = new Schema({
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection', required: true },
    taskCode: { type: String, required: true },
    description: { type: String },
    totalQuantity: { type: Number, required: true },
    consumedQuantity: { type: Number, default: 0 },
    unit: { type: String, required: true },
    rate: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} }
}, {
    timestamps: true,
});

// Ensure taskCode uniqueness per contract/section
BOQItemSchema.index({ contractId: 1, sectionId: 1, taskCode: 1 }, { unique: true });

export const BOQItem = mongoose.models.BOQItem || mongoose.model<IBOQItem>('BOQItem', BOQItemSchema);
