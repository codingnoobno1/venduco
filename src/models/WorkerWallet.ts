import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkerWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  pendingBalance: number;
  lifetimeEarned: number;
  lifetimeWithdrawn: number;
  defaultUpiId: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankAccountName: string;
  bankVerified: boolean;
  dailyWithdrawalLimit: number;
  tdsDeducted: number;
}

const WorkerWalletSchema = new Schema<IWorkerWallet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0, min: 0 },
  pendingBalance: { type: Number, default: 0, min: 0 },
  lifetimeEarned: { type: Number, default: 0 },
  lifetimeWithdrawn: { type: Number, default: 0 },
  defaultUpiId: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  bankAccountName: { type: String, default: '' },
  bankVerified: { type: Boolean, default: false },
  dailyWithdrawalLimit: { type: Number, default: 50000 },
  tdsDeducted: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.WorkerWallet ||
  mongoose.model<IWorkerWallet>('WorkerWallet', WorkerWalletSchema);
