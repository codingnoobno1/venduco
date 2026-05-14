import { NextResponse } from 'next/server';
import { getActiveConfig } from '@/lib/pricing';

// No auth — Flutter app reads this to know if payments are enabled,
// what the current gateway is, and whether to show the payment UI.
export async function GET() {
  const config = await getActiveConfig();

  const cfg = config as any;
  return NextResponse.json({
    success: true,
    data: {
      stage: cfg.stage ?? 'STAGE_0_PREMARKET',
      commissionEnabled: config.commissionEnabled,
      subscriptionEnabled: config.subscriptionEnabled,
      paymentGateway: config.paymentGateway,
      paymentMode: cfg.paymentMode ?? 'TEST',
      escrowEnabled: cfg.escrowEnabled ?? false,
      trialDays: config.trialDays,
    },
  });
}
