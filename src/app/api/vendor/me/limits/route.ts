import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { resolveVendorLimits } from '@/lib/pricing';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  await dbConnect();
  const dbUser = await User.findById(user.userId).select('tier tierStatus').lean() as any;

  const limits = await resolveVendorLimits(
    user.userId,
    dbUser?.tier,
    dbUser?.tierStatus
  );

  return NextResponse.json({ success: true, data: limits });
}
