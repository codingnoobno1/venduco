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
    stage: 'STAGE_0_PREMARKET',
    commissionEnabled: false,
    commissionRate: 0,
    commissionMode: 'PERCENTAGE',
    commissionCap: 0,
    perDayFee: 0,
    perHireFee: 0,
    subscriptionEnabled: false,
    trialDays: 14,
    freeTierLimits: { maxJobs: 3, maxHires: 5, maxTeams: 1 },
    paymentGateway: 'DUMMY',
    paymentMode: 'TEST',
    escrowEnabled: false,
    pricingPageVisible: false,
    upgradePromptsEnabled: false,
    messaging: 'Founding Partner — Free Access',
    pricingLockGracePeriodDays: 365,
    newPriceNotificationDays: 60,
  });

  console.log('Stage 0 config seeded:', config._id);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
