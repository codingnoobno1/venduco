import dbConnect from './db';
import FeatureFlag from '@/models/FeatureFlag';
import { createHash } from 'crypto';

function stableHashPercentage(vendorId: string, flagKey: string): number {
  const hash = createHash('md5').update(`${flagKey}:${vendorId}`).digest('hex');
  return (parseInt(hash.slice(0, 8), 16) % 100) + 1;
}

export async function isFeatureEnabled(
  flagKey: string,
  context: {
    vendorId?: string;
    city?: string;
    tier?: string;
    isNewUser?: boolean;
  } = {}
): Promise<boolean> {
  await dbConnect();

  const flag = await FeatureFlag.findOne({ key: flagKey }).lean();
  if (!flag || !flag.isEnabled) return false;

  const now = new Date();

  if (flag.scheduledEnableAt && now < flag.scheduledEnableAt) return false;
  if (flag.scheduledDisableAt && now >= flag.scheduledDisableAt) return false;

  const { vendorId, city, tier, isNewUser } = context;

  if (vendorId && flag.excludeVendorIds?.some((id: any) => id.toString() === vendorId)) {
    return false;
  }

  switch (flag.rolloutStrategy) {
    case 'ALL':
      return true;

    case 'PERCENTAGE':
      if (!vendorId) return false;
      return stableHashPercentage(vendorId, flagKey) <= flag.rolloutPercentage;

    case 'WHITELIST':
      if (!vendorId) return false;
      return flag.whitelistVendorIds?.some((id: any) => id.toString() === vendorId) ?? false;

    case 'NEW_USERS_ONLY':
      return isNewUser === true;

    case 'CITY':
      if (!city) return false;
      return flag.cityWhitelist?.includes(city) ?? false;

    case 'TIER':
      if (!tier) return false;
      return flag.tierWhitelist?.includes(tier) ?? false;

    default:
      return false;
  }
}
