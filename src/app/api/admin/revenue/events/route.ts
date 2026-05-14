import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RevenueEvent from '@/models/RevenueEvent';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
  const type = searchParams.get('type');
  const vendorId = searchParams.get('vendorId');
  const excludeDummy = searchParams.get('excludeDummy') === 'true';

  await dbConnect();

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (vendorId) filter.vendorId = vendorId;
  if (excludeDummy) filter.isDummyTransaction = false;
  if (cursor) filter._id = { $lt: cursor };

  const events = await RevenueEvent.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = events.length > limit;
  const data = hasMore ? events.slice(0, limit) : events;
  const nextCursor = hasMore ? String(data[data.length - 1]._id) : null;

  return NextResponse.json({ success: true, data, nextCursor });
}
