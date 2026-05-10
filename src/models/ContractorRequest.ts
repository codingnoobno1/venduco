import mongoose, { Schema, Document } from 'mongoose'

export interface IContractorRequest extends Document {
    contractorId: mongoose.Types.ObjectId
    type: 'WORKER' | 'MACHINE' | 'TEAM'
    title: string
    description: string
    quantity: number
    location: string
    budget?: number
    requiredBy: Date
    status: 'OPEN' | 'IN_NEGOTIATION' | 'FULFILLED' | 'CANCELLED'
    createdAt: Date
    updatedAt: Date
}

const ContractorRequestSchema = new Schema<IContractorRequest>(
    {
        contractorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['WORKER', 'MACHINE', 'TEAM'], required: true },
        title: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, default: 1 },
        location: { type: String, required: true },
        budget: { type: Number },
        requiredBy: { type: Date, required: true },
        status: {
            type: String,
            enum: ['OPEN', 'IN_NEGOTIATION', 'FULFILLED', 'CANCELLED'],
            default: 'OPEN'
        }
    },
    { timestamps: true }
)

export const ContractorRequest = mongoose.models.ContractorRequest || mongoose.model<IContractorRequest>('ContractorRequest', ContractorRequestSchema)
