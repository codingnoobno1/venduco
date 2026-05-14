import mongoose, { Schema, Document } from 'mongoose';

export interface TierConfig {
  enabled: boolean;
  price: number;
  annualPrice: number;
  maxJobs: number;
  maxHires: number;
  maxTeams: number;
  commissionDiscount: number;
  features: string[];
}

export interface IPlatformConfig extends Document {
  isActive: boolean;
  stage: 'STAGE_0_PREMARKET' | 'STAGE_1_EARLY_GROWTH' | 'STAGE_2_PMF' | 'STAGE_3_SCALE';
  commissionEnabled: boolean;
  commissionRate: number;
  commissionMode: 'PERCENTAGE' | 'PER_DAY' | 'PER_HIRE' | 'FLAT';
  commissionCap: number;
  perDayFee: number;
  perHireFee: number;
  subscriptionEnabled: boolean;
  trialDays: number;
  tiers: { FREE: TierConfig; STARTER: TierConfig; PRO: TierConfig; ENTERPRISE: TierConfig };
  freeTierLimits: { maxJobs: number; maxHires: number; maxTeams: number };
  premiumFeatures: {
    boostEnabled: boolean;
    verifiedBadgeEnabled: boolean;
    backgroundCheckEnabled: boolean;
    analyticsEnabled: boolean;
    apiAccessEnabled: boolean;
    aiProposalEnabled: boolean;
  };
  paymentGateway: 'DUMMY' | 'RAZORPAY' | 'CASHFREE';
  paymentMode: 'TEST' | 'LIVE';
  escrowEnabled: boolean;
  pricingLockGracePeriodDays: number;
  newPriceNotificationDays: number;
  messaging: string;
  pricingPageVisible: boolean;
  upgradePromptsEnabled: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  changeReason?: string;
}

const TierConfigSchema = new Schema<TierConfig>({
  enabled: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  annualPrice: { type: Number, default: 0 },
  maxJobs: { type: Number, default: -1 },
  maxHires: { type: Number, default: -1 },
  maxTeams: { type: Number, default: -1 },
  commissionDiscount: { type: Number, default: 0 },
  features: [String],
}, { _id: false });

const PlatformConfigSchema = new Schema<IPlatformConfig>({
  isActive: { type: Boolean, default: false, index: true },
  stage: {
    type: String,
    enum: ['STAGE_0_PREMARKET', 'STAGE_1_EARLY_GROWTH', 'STAGE_2_PMF', 'STAGE_3_SCALE'],
    default: 'STAGE_0_PREMARKET',
  },
  commissionEnabled: { type: Boolean, default: false },
  commissionRate: { type: Number, default: 0, min: 0, max: 100 },
  commissionMode: {
    type: String,
    enum: ['PERCENTAGE', 'PER_DAY', 'PER_HIRE', 'FLAT'],
    default: 'PERCENTAGE',
  },
  commissionCap: { type: Number, default: 0 },
  perDayFee: { type: Number, default: 0 },
  perHireFee: { type: Number, default: 0 },
  subscriptionEnabled: { type: Boolean, default: false },
  trialDays: { type: Number, default: 14 },
  tiers: {
    FREE: { type: TierConfigSchema, default: () => ({ enabled: true, price: 0, annualPrice: 0, maxJobs: 3, maxHires: 10, maxTeams: 1, commissionDiscount: 0, features: [] }) },
    STARTER: { type: TierConfigSchema, default: () => ({ enabled: true, price: 199, annualPrice: 1990, maxJobs: 10, maxHires: 30, maxTeams: 3, commissionDiscount: 0, features: [] }) },
    PRO: { type: TierConfigSchema, default: () => ({ enabled: true, price: 499, annualPrice: 4990, maxJobs: -1, maxHires: -1, maxTeams: -1, commissionDiscount: 1, features: ['analytics', 'boost', 'api'] }) },
    ENTERPRISE: { type: TierConfigSchema, default: () => ({ enabled: true, price: 0, annualPrice: 0, maxJobs: -1, maxHires: -1, maxTeams: -1, commissionDiscount: 2, features: ['analytics', 'boost', 'api', 'dedicated_support'] }) },
  },
  freeTierLimits: {
    maxJobs: { type: Number, default: 3 },
    maxHires: { type: Number, default: 10 },
    maxTeams: { type: Number, default: 1 },
  },
  premiumFeatures: {
    boostEnabled: { type: Boolean, default: false },
    verifiedBadgeEnabled: { type: Boolean, default: false },
    backgroundCheckEnabled: { type: Boolean, default: false },
    analyticsEnabled: { type: Boolean, default: false },
    apiAccessEnabled: { type: Boolean, default: false },
    aiProposalEnabled: { type: Boolean, default: false },
  },
  paymentGateway: { type: String, enum: ['DUMMY', 'RAZORPAY', 'CASHFREE'], default: 'DUMMY' },
  paymentMode: { type: String, enum: ['TEST', 'LIVE'], default: 'TEST' },
  escrowEnabled: { type: Boolean, default: false },
  pricingLockGracePeriodDays: { type: Number, default: 365 },
  newPriceNotificationDays: { type: Number, default: 60 },
  messaging: { type: String, default: 'Founding Partner — Free Access' },
  pricingPageVisible: { type: Boolean, default: false },
  upgradePromptsEnabled: { type: Boolean, default: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  changeReason: String,
}, { timestamps: true });

export default mongoose.models.PlatformConfig ||
  mongoose.model<IPlatformConfig>('PlatformConfig', PlatformConfigSchema);
