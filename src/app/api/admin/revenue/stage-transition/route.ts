import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { invalidateConfigCache } from '@/lib/pricing';
import { invalidateGatewayCache } from '@/lib/payment-gateway';
import dbConnect from '@/lib/db';
import PlatformConfig from '@/models/PlatformConfig';

const STAGE_PRESETS: Record<number, Record<string, unknown>> = {
  0: {
    stage: 0,
    commissionEnabled: false,
    subscriptionEnabled: false,
    paymentMode: 'DISABLED',
    paymentGateway: 'DUMMY',
  },
  1: {
    stage: 1,
    commissionEnabled: false,
    subscriptionEnabled: true,
    paymentMode: 'SUBSCRIPTION_ONLY',
    paymentGateway: 'DUMMY',
  },
  2: {
    stage: 2,
    commissionEnabled: true,
    commissionRate: 2,
    commissionMode: 'PERCENTAGE',
    subscriptionEnabled: true,
    paymentMode: 'FULL',
    paymentGateway: 'RAZORPAY',
  },
  3: {
    stage: 3,
    commissionEnabled: true,
    commissionRate: 5,
    commissionMode: 'PERCENTAGE',
    subscriptionEnabled: true,
    paymentMode: 'FULL',
    paymentGateway: 'RAZORPAY',
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
