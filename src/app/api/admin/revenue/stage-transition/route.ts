import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { invalidateConfigCache } from '@/lib/pricing';
import { invalidateGatewayCache } from '@/lib/payment-gateway';
import dbConnect from '@/lib/db';
import PlatformConfig from '@/models/PlatformConfig';

const STAGE_PRESETS: Record<number, Record<string, unknown>> = {
  0: {
    stage: 'STAGE_0_PREMARKET',
    commissionEnabled: false,
    subscriptionEnabled: false,
    paymentMode: 'TEST',
    paymentGateway: 'DUMMY',
    escrowEnabled: false,
    pricingPageVisible: false,
    upgradePromptsEnabled: false,
  },
  1: {
    stage: 'STAGE_1_EARLY_GROWTH',
    commissionEnabled: false,
    subscriptionEnabled: true,
    paymentMode: 'TEST',
    paymentGateway: 'DUMMY',
    escrowEnabled: true,
    pricingPageVisible: true,
    upgradePromptsEnabled: true,
  },
  2: {
    stage: 'STAGE_2_PMF',
    commissionEnabled: true,
    commissionRate: 2,
    commissionMode: 'PERCENTAGE',
    subscriptionEnabled: true,
    paymentMode: 'LIVE',
    paymentGateway: 'RAZORPAY',
    escrowEnabled: true,
    pricingPageVisible: true,
    upgradePromptsEnabled: true,
  },
  3: {
    stage: 'STAGE_3_SCALE',
    commissionEnabled: true,
    commissionRate: 5,
    commissionMode: 'PERCENTAGE',
    subscriptionEnabled: true,
    paymentMode: 'LIVE',
    paymentGateway: 'RAZORPAY',
    escrowEnabled: true,
    pricingPageVisible: true,
    upgradePromptsEnabled: true,
  },
};

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { targetStage, overrides } = await req.json();

  if (![0, 1, 2, 3].includes(targetStage)) {
    return NextResponse.json({ success: false, error: 'targetStage must be 0-3' }, { status: 400 });
  }

  await dbConnect();

  const preset = { ...STAGE_PRESETS[targetStage], ...overrides };

  const config = await PlatformConfig.findOneAndUpdate(
    { isActive: true },
    { $set: preset },
    { new: true }
  );

  if (!config) {
    return NextResponse.json({ success: false, error: 'No active config' }, { status: 404 });
  }

  invalidateConfigCache();
  invalidateGatewayCache();

  return NextResponse.json({
    success: true,
    stage: targetStage,
    data: config,
  });
}
