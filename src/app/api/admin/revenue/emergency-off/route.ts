import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { invalidateConfigCache } from '@/lib/pricing';
import { invalidateGatewayCache } from '@/lib/payment-gateway';
import dbConnect from '@/lib/db';
import PlatformConfig from '@/models/PlatformConfig';

// Kill-switch: turns off all monetisation immediately without going through the
// stage transition wizard. Useful in a billing emergency or legal hold.
export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  await dbConnect();

  await PlatformConfig.updateOne(
    { isActive: true },
    {
      $set: {
        commissionEnabled: false,
        subscriptionEnabled: false,
        paymentMode: 'TEST',
        escrowEnabled: false,
      },
    }
  );

  invalidateConfigCache();
  invalidateGatewayCache();

  return NextResponse.json({
    success: true,
    message: 'All revenue collection disabled. Config cache invalidated.',
  });
}
