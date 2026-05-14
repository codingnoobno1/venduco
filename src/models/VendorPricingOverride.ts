import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorPricingOverride extends Document {
  vendorId: mongoose.Types.ObjectId;
  commissionEnabledOverride: boolean | null;
  commissionRateOverride: number | null;
  perDayFeeOverride: number | null;
  subscriptionPriceOverride: number | null;
  maxJobsOverride: number | null;
  maxHiresOverride: number | null;
  effectiveFrom: Date;
  validUntil: Date | null;
  reason: 'FOUNDING_PARTNER' | 'ENTERPRISE_DEAL' | 'PROMO' | 'COMPENSATION' | 'BETA_TESTER';
  internalNote: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

const VendorPricingOverrideSchema = new Schema<IVendorPricingOverride>({
  vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  commissionEnabledOverride: { type: Boolean, default: null },
  commissionRateOverride: { type: Number, default: null },
  perDayFeeOverride: { type: Number, default: null },
  subscriptionPriceOverride: { type: Number, default: null },
  maxJobsOverride: { type: Number, default: null },
  maxHiresOverride: { type: Number, default: null },
  effectiveFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, default: null },
  reason: {
    type: String,
    enum: ['FOUNDING_PARTNER', 'ENTERPRISE_DEAL', 'PROMO', 'COMPENSATION', 'BETA_TESTER'],
    required: true,
  },
  internalNote: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

VendorPricingOverrideSchema.index({ vendorId: 1, isActive: 1 });
VendorPricingOverrideSchema.index({ validUntil: 1 });
VendorPricingOverrideSchema.index({ reason: 1 });

export default mongoose.models.VendorPricingOverride ||
  mongoose.model<IVendorPricingOverride>('VendorPricingOverride', VendorPricingOverrideSchema);
