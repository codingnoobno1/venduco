import mongoose, { Schema, Document } from 'mongoose';

export interface IRevenueEvent extends Document {
  type: 'COMMISSION_CHARGED' | 'SUBSCRIPTION_PAID' | 'BOOST_PURCHASED' | 'WAIVED';
  vendorId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId | null;
  baseAmount: number;
  feeAmount: number;
  feeRate: number;
  feeMode: string;
  capApplied: boolean;
  configVersion: mongoose.Types.ObjectId;
  overrideApplied: boolean;
  overrideId: mongoose.Types.ObjectId | null;
  waiverReason: string | null;
  isDummyTransaction: boolean;
}

const RevenueEventSchema = new Schema<IRevenueEvent>({
  type: {
    type: String,
    enum: ['COMMISSION_CHARGED', 'SUBSCRIPTION_PAID', 'BOOST_PURCHASED', 'WAIVED'],
    required: true,
  },
  vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', default: null },
  baseAmount: { type: Number, default: 0 },
  feeAmount: { type: Number, default: 0 },
  feeRate: { type: Number, default: 0 },
  feeMode: { type: String, default: 'NONE' },
  capApplied: { type: Boolean, default: false },
  configVersion: { type: Schema.Types.ObjectId, ref: 'PlatformConfig', required: true },
  overrideApplied: { type: Boolean, default: false },
  overrideId: { type: Schema.Types.ObjectId, ref: 'VendorPricingOverride', default: null },
  waiverReason: { type: String, default: null },
  isDummyTransaction: { type: Boolean, default: true },
}, { timestamps: true });

RevenueEventSchema.index({ vendorId: 1, createdAt: -1 });
RevenueEventSchema.index({ type: 1, createdAt: -1 });
RevenueEventSchema.index({ isDummyTransaction: 1 });

export default mongoose.models.RevenueEvent ||
  mongoose.model<IRevenueEvent>('RevenueEvent', RevenueEventSchema);
