import { NextResponse } from 'next/server';
import { getActiveConfig } from '@/lib/pricing';

// No auth — Flutter app reads this to know if payments are enabled,
// what the current gateway is, and whether to show the payment UI.
export async function GET() {
  const config = await getActiveConfig();

  return NextResponse.json({
    success: true,
    data: {
      stage: (config as any).stage ?? 0,
      commissionEnabled: config.commissionEnabled,
      subscriptionEnabled: config.subscriptionEnabled,
      paymentGateway: config.paymentGateway,
      paymentMode: (config as any).paymentMode ?? 'DISABLED',
      trialDays: config.trialDays,
    },
  });
}
