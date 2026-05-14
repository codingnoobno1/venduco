import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PlatformConfig from '@/models/PlatformConfig';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  await dbConnect();
  const configs = await PlatformConfig.find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json({ success: true, data: configs });
}
