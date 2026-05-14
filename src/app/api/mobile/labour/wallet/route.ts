import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import WorkerWallet from '@/models/WorkerWallet';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  await dbConnect();

  const wallet = await WorkerWallet.findOneAndUpdate(
    { userId: user.userId },
    { $setOnInsert: { userId: user.userId } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ success: true, data: wallet });
}

export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { defaultUpiId, bankAccountNumber, ifscCode, bankAccountName } = await req.json();
  await dbConnect();

  const wallet = await WorkerWallet.findOneAndUpdate(
    { userId: user.userId },
    { $set: { defaultUpiId, bankAccountNumber, ifscCode, bankAccountName } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ success: true, data: wallet });
}
