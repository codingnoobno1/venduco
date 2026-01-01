import mongoose, { Schema, Document } from 'mongoose'

export enum InvoiceType {
    LABOUR = 'LABOUR',
    MACHINE = 'MACHINE',
    MATERIAL = 'MATERIAL',
    SPECIAL_WORK = 'SPECIAL_WORK',
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    INSPECTION_ASSIGNED = 'INSPECTION_ASSIGNED',
    TESTING_REQUIRED = 'TESTING_REQUIRED',
    APPROVED = 'APPROVED',
    BILLED = 'BILLED',
    PAID = 'PAID',
    REJECTED = 'REJECTED',
    ON_HOLD = 'ON_HOLD',
}

export interface IInvoice extends Document {
    projectId: mongoose.Types.ObjectId | string
    contractId: mongoose.Types.ObjectId | string
    vendorId: mongoose.Types.ObjectId | string
    sectionId?: mongoose.Types.ObjectId | string
    invoiceType: InvoiceType
    invoiceNumber: string
    amount: number
    currency: string
    periodFrom: Date
    periodTo: Date
    status: InvoiceStatus
    linkedProgressIds?: mongoose.Types.ObjectId[] | string[]
    linkedMachineRentalIds?: mongoose.Types.ObjectId[] | string[]
    linkedDeliveryIds?: mongoose.Types.ObjectId[] | string[]
    description?: string
    attachmentUrls?: string[]
    rejectionReason?: string
    submittedAt: Date
    createdAt: Date
    updatedAt: Date
}

const InvoiceSchema = new Schema<IInvoice>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        sectionId: { type: Schema.Types.ObjectId, ref: 'ProjectSection' },
        invoiceType: {
            type: String,
            enum: Object.values(InvoiceType),
            required: true,
        },
        invoiceNumber: { type: String, required: true, unique: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'INR' },
        periodFrom: { type: Date, required: true },
        periodTo: { type: Date, required: true },
        status: {
            type: String,
            enum: Object.values(InvoiceStatus),
            default: InvoiceStatus.DRAFT,
        },
        linkedProgressIds: [{ type: Schema.Types.ObjectId, ref: 'SectionProgress' }],
        linkedMachineRentalIds: [{ type: Schema.Types.ObjectId, ref: 'MachineRental' }],
        linkedDeliveryIds: [{ type: Schema.Types.ObjectId, ref: 'MaterialDelivery' }],
        description: { type: String },
        attachmentUrls: [{ type: String }],
        rejectionReason: { type: String },
        submittedAt: { type: Date },
    },
    { timestamps: true }
)

InvoiceSchema.index({ vendorId: 1, status: 1 })
InvoiceSchema.index({ projectId: 1, invoiceNumber: 1 }, { unique: true })

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema)
