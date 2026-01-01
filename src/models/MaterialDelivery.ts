import mongoose, { Schema, Document } from 'mongoose'

export enum DeliveryStatus {
    REQUESTED = 'REQUESTED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

export interface IMaterialDelivery extends Document {
    projectId: mongoose.Types.ObjectId | string
    vendorId: mongoose.Types.ObjectId | string
    contractId: mongoose.Types.ObjectId | string
    sectionId?: mongoose.Types.ObjectId | string
    itemDescription: string
    quantity: number
    unit: string
    challanNumber: string
    deliveryDate: Date
    status: DeliveryStatus
    remarks?: string
    attachmentUrls?: string[]
    verifiedBy?: mongoose.Types.ObjectId | string
    verifiedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const MaterialDeliverySchema = new Schema<IMaterialDelivery>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
        sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection' },
        itemDescription: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        challanNumber: { type: String, required: true },
        deliveryDate: { type: Date, required: true },
        status: {
            type: String,
            enum: Object.values(DeliveryStatus),
            default: DeliveryStatus.REQUESTED,
        },
        remarks: { type: String },
        attachmentUrls: [{ type: String }],
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
    },
    { timestamps: true }
)

MaterialDeliverySchema.index({ projectId: 1, challanNumber: 1 }, { unique: true })

export const MaterialDelivery = mongoose.models.MaterialDelivery || mongoose.model<IMaterialDelivery>('MaterialDelivery', MaterialDeliverySchema)
