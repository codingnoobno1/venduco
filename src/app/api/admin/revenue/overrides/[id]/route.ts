import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import VendorPricingOverride from '@/models/VendorPricingOverride';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  await dbConnect();

  const override = await VendorPricingOverride.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!override) {
    return NextResponse.json({ success: false, error: 'Override not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: override });
}
