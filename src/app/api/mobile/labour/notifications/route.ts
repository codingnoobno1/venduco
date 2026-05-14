import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Notification } from '@/models';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 100);

  await dbConnect();

  const filter: Record<string, unknown> = { userId: user.userId };
  if (cursor) filter._id = { $lt: cursor };

  const notifications = await Notification.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = notifications.length > limit;
  const data = hasMore ? notifications.slice(0, limit) : notifications;

  return NextResponse.json({
    success: true,
    data,
    nextCursor: hasMore ? String(data[data.length - 1]._id) : null,
  });
}

export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { notificationIds } = await req.json();
  await dbConnect();

  await Notification.updateMany(
    { _id: { $in: notificationIds }, userId: user.userId },
    { $set: { isRead: true } }
  );

  return NextResponse.json({ success: true });
}
