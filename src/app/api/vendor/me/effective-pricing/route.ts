import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { calculateRevenue } from '@/lib/pricing';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sampleAmount = parseFloat(searchParams.get('amount') ?? '10000');

  const breakdown = await calculateRevenue({
    totalAmount: sampleAmount,
    vendorId: user.userId,
  });

  return NextResponse.json({ success: true, data: breakdown });
}
