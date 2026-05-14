/**
 * Run once on first deploy: npx tsx src/scripts/seed-config.ts
 * Seeds Stage 0 — everything free, dummy payment, all charges off.
 */
import dbConnect from '../lib/db';
import PlatformConfig from '../models/PlatformConfig';

async function main() {
  await dbConnect();

  const existing = await PlatformConfig.findOne({ isActive: true });
  if (existing) {
    console.log('Active config already exists:', existing._id);
    process.exit(0);
  }

  const config = await PlatformConfig.create({
    isActive: true,
    stage: 0,
    commissionEnabled: false,
    commissionRate: 0,
    commissionMode: 'PERCENTAGE',
    commissionCap: 0,
    perDayFee: 0,
    perHireFee: 0,
    subscriptionEnabled: false,
    trialDays: 0,
    tiers: {
      FREE: { monthlyPrice: 0, yearlyPrice: 0, commissionDiscount: 0, maxJobs: 3, maxHires: 5, maxTeams: 1, features: [] },
      STARTER: { monthlyPrice: 499, yearlyPrice: 4999, commissionDiscount: 0.5, maxJobs: 20, maxHires: 50, maxTeams: 3, features: ['priority_support'] },
      PRO: { monthlyPrice: 1499, yearlyPrice: 14999, commissionDiscount: 1, maxJobs: 100, maxHires: 200, maxTeams: 10, features: ['priority_support', 'analytics', 'bulk_hire'] },
      ENTERPRISE: { monthlyPrice: 4999, yearlyPrice: 49999, commissionDiscount: 2, maxJobs: -1, maxHires: -1, maxTeams: -1, features: ['priority_support', 'analytics', 'bulk_hire', 'dedicated_account_manager', 'custom_contracts'] },
    },
    freeTierLimits: { maxJobs: 3, maxHires: 5, maxTeams: 1 },
    premiumFeatures: [],
    paymentGateway: 'DUMMY',
    paymentMode: 'DISABLED',
    pricingLockGracePeriodDays: 60,
    newPriceNotificationDays: 14,
  });

  console.log('Stage 0 config seeded:', config._id);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
