import mongoose, { Schema, Document } from 'mongoose';

export type EscrowStatus =
  | 'PENDING_PAYMENT' | 'ESCROWED' | 'RELEASING' | 'DISPUTED'
  | 'RELEASED' | 'DISBURSED' | 'REFUNDED';

export interface WorkerSplit {
  labourId: mongoose.Types.ObjectId;
  amount: number;
  upiId: string;
  payoutId: string;
  status: 'PENDING' | 'INITIATED' | 'PAID' | 'FAILED';
}

export interface IEscrowTransaction extends Document {
  invoiceId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  grossAmount: number;
  platformFee: number;
  platformGST: number;
  netPayable: number;
  workerSplits: WorkerSplit[];
  gatewayName: 'DUMMY' | 'RAZORPAY' | 'CASHFREE';
  orderId: string;
  paymentId: string;
  payoutBatchId: string;
  status: EscrowStatus;
  escrowedAt: Date | null;
  releaseAt: Date | null;
  releasedAt: Date | null;
  disbursedAt: Date | null;
  disputeRaisedAt: Date | null;
  disputeReason: string;
  disputeResolvedAt: Date | null;
  disputeResolution: 'FULL_RELEASE' | 'PARTIAL_RELEASE' | 'FULL_REFUND' | null;
}

const WorkerSplitSchema = new Schema<WorkerSplit>({
  labourId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  upiId: { type: String, default: '' },
  payoutId: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'INITIATED', 'PAID', 'FAILED'], default: 'PENDING' },
}, { _id: false });

const EscrowTransactionSchema = new Schema<IEscrowTransaction>({
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, unique: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  grossAmount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  platformGST: { type: Number, default: 0 },
  netPayable: { type: Number, required: true },
  workerSplits: [WorkerSplitSchema],
  gatewayName: { type: String, enum: ['DUMMY', 'RAZORPAY', 'CASHFREE'], default: 'DUMMY' },
  orderId: { type: String, default: '' },
  paymentId: { type: String, default: '' },
  payoutBatchId: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING_PAYMENT', 'ESCROWED', 'RELEASING', 'DISPUTED', 'RELEASED', 'DISBURSED', 'REFUNDED'],
    default: 'PENDING_PAYMENT',
  },
  escrowedAt: { type: Date, default: null },
  releaseAt: { type: Date, default: null },
  releasedAt: { type: Date, default: null },
  disbursedAt: { type: Date, default: null },
  disputeRaisedAt: { type: Date, default: null },
  disputeReason: { type: String, default: '' },
  disputeResolvedAt: { type: Date, default: null },
  disputeResolution: { type: String, enum: ['FULL_RELEASE', 'PARTIAL_RELEASE', 'FULL_REFUND', null], default: null },
}, { timestamps: true });

EscrowTransactionSchema.index({ vendorId: 1, status: 1 });
EscrowTransactionSchema.index({ status: 1, releaseAt: 1 });

export default mongoose.models.EscrowTransaction ||
  mongoose.model<IEscrowTransaction>('EscrowTransaction', EscrowTransactionSchema);
