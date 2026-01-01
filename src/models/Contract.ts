import mongoose, { Schema, Document } from 'mongoose'

export enum ContractRole {
    SUPPLIER = 'SUPPLIER',
    SUBCONTRACTOR = 'SUBCONTRACTOR',
}

export enum ContractScopeType {
    MATERIAL = 'MATERIAL',
    MACHINE = 'MACHINE',
    WORK_PACKAGE = 'WORK_PACKAGE',
}

export enum ContractStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
    TERMINATED = 'TERMINATED',
}

export interface IContract extends Document {
    projectId: mongoose.Types.ObjectId | string
    vendorId: mongoose.Types.ObjectId | string
    bidId?: mongoose.Types.ObjectId | string
    role: ContractRole
    scopeType: ContractScopeType
    startDate: Date
    endDate: Date
    agreedRate: number
    currency: string
    status: ContractStatus
    termsAndConditions?: string
    createdAt: Date
    updatedAt: Date
}

const ContractSchema = new Schema<IContract>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        bidId: { type: Schema.Types.ObjectId, ref: 'Bid' },
        role: {
            type: String,
            enum: Object.values(ContractRole),
            required: true,
        },
        scopeType: {
            type: String,
            enum: Object.values(ContractScopeType),
            required: true,
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        agreedRate: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'INR' },
        status: {
            type: String,
            enum: Object.values(ContractStatus),
            default: ContractStatus.ACTIVE,
        },
        termsAndConditions: { type: String },
    },
    { timestamps: true }
)

ContractSchema.index({ projectId: 1, vendorId: 1 })
ContractSchema.index({ status: 1 })

export const Contract = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema)
