import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FeatureFlag from '@/models/FeatureFlag';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { key } = await params;
  const body = await req.json();
  await dbConnect();

  const flag = await FeatureFlag.findOneAndUpdate(
    { key },
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!flag) {
    return NextResponse.json({ success: false, error: 'Flag not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: flag });
}
