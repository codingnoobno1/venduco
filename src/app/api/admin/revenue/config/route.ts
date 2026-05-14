import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getActiveConfig, invalidateConfigCache } from '@/lib/pricing';
import { invalidateGatewayCache } from '@/lib/payment-gateway';
import dbConnect from '@/lib/db';
import PlatformConfig from '@/models/PlatformConfig';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const config = await getActiveConfig();
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await req.json();
  await dbConnect();

  const config = await PlatformConfig.findOneAndUpdate(
    { isActive: true },
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!config) {
    return NextResponse.json({ success: false, error: 'No active config found' }, { status: 404 });
  }

  invalidateConfigCache();
  invalidateGatewayCache();

  return NextResponse.json({ success: true, data: config });
}
