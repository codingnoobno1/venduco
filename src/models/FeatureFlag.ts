import mongoose, { Schema, Document } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  description: string;
  isEnabled: boolean;
  rolloutStrategy: 'ALL' | 'PERCENTAGE' | 'WHITELIST' | 'NEW_USERS_ONLY' | 'CITY' | 'TIER';
  rolloutPercentage: number;
  whitelistVendorIds: mongoose.Types.ObjectId[];
  cityWhitelist: string[];
  tierWhitelist: string[];
  excludeVendorIds: mongoose.Types.ObjectId[];
  scheduledEnableAt: Date | null;
  scheduledDisableAt: Date | null;
  createdBy: mongoose.Types.ObjectId;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>({
  key: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  isEnabled: { type: Boolean, default: false, index: true },
  rolloutStrategy: {
    type: String,
    enum: ['ALL', 'PERCENTAGE', 'WHITELIST', 'NEW_USERS_ONLY', 'CITY', 'TIER'],
    default: 'ALL',
  },
  rolloutPercentage: { type: Number, default: 100, min: 0, max: 100 },
  whitelistVendorIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  cityWhitelist: [String],
  tierWhitelist: [String],
  excludeVendorIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  scheduledEnableAt: { type: Date, default: null },
  scheduledDisableAt: { type: Date, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.FeatureFlag ||
  mongoose.model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);
