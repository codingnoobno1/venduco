import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FeatureFlag from '@/models/FeatureFlag';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  await dbConnect();
  const flags = await FeatureFlag.find({}).sort({ key: 1 }).lean();
  return NextResponse.json({ success: true, data: flags });
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await req.json();
  await dbConnect();

  const flag = await FeatureFlag.create({ ...body, createdBy: user.userId });
  return NextResponse.json({ success: true, data: flag }, { status: 201 });
}
