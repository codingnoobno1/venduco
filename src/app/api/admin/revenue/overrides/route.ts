import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import VendorPricingOverride from '@/models/VendorPricingOverride';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get('vendorId');
  const isActive = searchParams.get('isActive');

  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (vendorId) filter.vendorId = vendorId;
  if (isActive !== null) filter.isActive = isActive === 'true';

  const overrides = await VendorPricingOverride.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, data: overrides });
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await req.json();
  await dbConnect();

  const override = await VendorPricingOverride.create({
    ...body,
    createdBy: user.userId,
    isActive: true,
  });

  return NextResponse.json({ success: true, data: override }, { status: 201 });
}
