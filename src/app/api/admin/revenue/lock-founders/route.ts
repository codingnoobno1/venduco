import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import VendorPricingOverride from '@/models/VendorPricingOverride';

// Bulk-create lifetime ₹0 commission overrides for a list of founding partner vendors.
// Idempotent — skips vendors that already have a FOUNDING_PARTNER override.
export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { vendorIds }: { vendorIds: string[] } = await req.json();
  if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
    return NextResponse.json({ success: false, error: 'vendorIds array required' }, { status: 400 });
  }

  await dbConnect();

  const existing = await VendorPricingOverride.find({
    vendorId: { $in: vendorIds },
    reason: 'FOUNDING_PARTNER',
  }).select('vendorId').lean();

  const existingIds = new Set(existing.map((o: any) => String(o.vendorId)));
  const toCreate = vendorIds.filter(id => !existingIds.has(id));

  if (toCreate.length > 0) {
    await VendorPricingOverride.insertMany(
      toCreate.map(vendorId => ({
        vendorId,
        commissionRateOverride: 0,
        commissionEnabledOverride: false,
        reason: 'FOUNDING_PARTNER',
        isActive: true,
        effectiveFrom: new Date(),
        validUntil: null,
        createdBy: user.userId,
      }))
    );
  }

  return NextResponse.json({
    success: true,
    locked: toCreate.length,
    alreadyLocked: existingIds.size,
  });
}
