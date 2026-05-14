import dbConnect from './db';
import PlatformConfig, { IPlatformConfig } from '@/models/PlatformConfig';
import VendorPricingOverride from '@/models/VendorPricingOverride';
import RevenueEvent from '@/models/RevenueEvent';

export interface FeeBreakdown {
  baseAmount: number;
  feeAmount: number;
  feeRate: number;
  feeMode: string;
  capApplied: boolean;
  overrideApplied: boolean;
  configVersion: string;
  netPayable: number;
  gstOnFee: number;
  vendorTotalCharge: number;
}

export interface VendorLimits {
  maxJobs: number;
  maxHires: number;
  maxTeams: number;
  isUnlimited: boolean;
}

let _configCache: IPlatformConfig | null = null;
let _configCachedAt = 0;
const CONFIG_TTL_MS = 60_000; // 60 seconds

export async function getActiveConfig(): Promise<IPlatformConfig> {
  const now = Date.now();
  if (_configCache && now - _configCachedAt < CONFIG_TTL_MS) return _configCache;

  await dbConnect();
  const config = await PlatformConfig.findOne({ isActive: true }).lean() as IPlatformConfig;
  if (!config) throw new Error('No active platform config found. Run seed-config script.');

  _configCache = config;
  _configCachedAt = now;
  return config;
}

export function invalidateConfigCache() {
  _configCache = null;
  _configCachedAt = 0;
}

async function getVendorOverride(vendorId: string) {
  await dbConnect();
  return VendorPricingOverride.findOne({
    vendorId,
    isActive: true,
    effectiveFrom: { $lte: new Date() },
    $or: [{ validUntil: null }, { validUntil: { $gt: new Date() } }],
  }).lean();
}

export async function calculateRevenue(invoice: {
  totalAmount: number;
  workerCount?: number;
  days?: number;
  vendorId: string;
  vendorTier?: string;
}): Promise<FeeBreakdown> {
  const config = await getActiveConfig();
  const override = await getVendorOverride(invoice.vendorId);

  const commissionEnabled =
    override?.commissionEnabledOverride !== null && override?.commissionEnabledOverride !== undefined
      ? override.commissionEnabledOverride
      : config.commissionEnabled;

  if (!commissionEnabled) {
    return zeroBreakdown(invoice.totalAmount, String(config._id));
  }

  const commissionRate =
    override?.commissionRateOverride !== null && override?.commissionRateOverride !== undefined
      ? override.commissionRateOverride
      : config.commissionRate;

  const perDayFee =
    override?.perDayFeeOverride !== null && override?.perDayFeeOverride !== undefined
      ? override.perDayFeeOverride
      : config.perDayFee;

  // Tier discount
  const tier = invoice.vendorTier as keyof typeof config.tiers | undefined;
  const tierDiscount = tier && config.tiers[tier] ? config.tiers[tier].commissionDiscount : 0;
  const effectiveRate = Math.max(0, commissionRate - tierDiscount);

  let feeAmount = 0;
  switch (config.commissionMode) {
    case 'PERCENTAGE':
      feeAmount = invoice.totalAmount * (effectiveRate / 100);
      break;
    case 'PER_DAY':
      feeAmount = perDayFee * (invoice.workerCount ?? 1) * (invoice.days ?? 1);
      break;
    case 'PER_HIRE':
      feeAmount = config.perHireFee * (invoice.workerCount ?? 1);
      break;
    case 'FLAT':
      feeAmount = config.commissionRate;
      break;
  }

  let capApplied = false;
  if (config.commissionCap > 0 && feeAmount > config.commissionCap) {
    feeAmount = config.commissionCap;
    capApplied = true;
  }

  feeAmount = Math.round(feeAmount * 100) / 100;
  const gstOnFee = Math.round(feeAmount * 0.18 * 100) / 100;

  return {
    baseAmount: invoice.totalAmount,
    feeAmount,
    feeRate: effectiveRate,
    feeMode: config.commissionMode,
    capApplied,
    overrideApplied: !!override,
    configVersion: String(config._id),
    netPayable: Math.round((invoice.totalAmount - feeAmount) * 100) / 100,
    gstOnFee,
    vendorTotalCharge: Math.round((invoice.totalAmount + feeAmount + gstOnFee) * 100) / 100,
  };
}

function zeroBreakdown(baseAmount: number, configVersion: string): FeeBreakdown {
  return {
    baseAmount,
    feeAmount: 0,
    feeRate: 0,
    feeMode: 'NONE',
    capApplied: false,
    overrideApplied: false,
    configVersion,
    netPayable: baseAmount,
    gstOnFee: 0,
    vendorTotalCharge: baseAmount,
  };
}

export async function calculateAndLog(
  invoice: Parameters<typeof calculateRevenue>[0] & { invoiceId?: string }
): Promise<FeeBreakdown> {
  const breakdown = await calculateRevenue(invoice);
  const config = await getActiveConfig();

  await RevenueEvent.create({
    type: breakdown.feeAmount > 0 ? 'COMMISSION_CHARGED' : 'WAIVED',
    vendorId: invoice.vendorId,
    invoiceId: invoice.invoiceId ?? null,
    baseAmount: breakdown.baseAmount,
    feeAmount: breakdown.feeAmount,
    feeRate: breakdown.feeRate,
    feeMode: breakdown.feeMode,
    capApplied: breakdown.capApplied,
    configVersion: breakdown.configVersion,
    overrideApplied: breakdown.overrideApplied,
    isDummyTransaction: config.paymentGateway === 'DUMMY',
  });

  return breakdown;
}

export async function resolveVendorLimits(
  vendorId: string,
  vendorTier?: string,
  tierStatus?: string
): Promise<VendorLimits> {
  const config = await getActiveConfig();
  const override = await getVendorOverride(vendorId);

  if (
    override?.maxJobsOverride !== null &&
    override?.maxJobsOverride !== undefined
  ) {
    return {
      maxJobs: override.maxJobsOverride,
      maxHires: override.maxHiresOverride ?? config.freeTierLimits.maxHires,
      maxTeams: config.freeTierLimits.maxTeams,
      isUnlimited: override.maxJobsOverride === -1,
    };
  }

  if (vendorTier && tierStatus === 'ACTIVE') {
    const tier = config.tiers[vendorTier as keyof typeof config.tiers];
    if (tier) {
      return {
        maxJobs: tier.maxJobs,
        maxHires: tier.maxHires,
        maxTeams: tier.maxTeams,
        isUnlimited: tier.maxJobs === -1,
      };
    }
  }

  return {
    maxJobs: config.freeTierLimits.maxJobs,
    maxHires: config.freeTierLimits.maxHires,
    maxTeams: config.freeTierLimits.maxTeams,
    isUnlimited: false,
  };
}
