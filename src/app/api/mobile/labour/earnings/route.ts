import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import EscrowTransaction from '@/models/EscrowTransaction';
import WorkerWallet from '@/models/WorkerWallet';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);

  await dbConnect();

  const [wallet, transactions] = await Promise.all([
    WorkerWallet.findOne({ userId: user.userId }).lean(),
    EscrowTransaction.find(
      {
        'workerSplits.labourId': user.userId,
        status: { $in: ['RELEASED', 'DISBURSED'] },
        ...(cursor ? { _id: { $lt: cursor } } : {}),
      },
      { workerSplits: 1, status: 1, disbursedAt: 1, releasedAt: 1, grossAmount: 1 }
    )
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean(),
  ]);

  const hasMore = transactions.length > limit;
  const data = hasMore ? transactions.slice(0, limit) : transactions;

  const earnings = data.map((tx: any) => {
    const mySplit = tx.workerSplits.find(
      (s: any) => String(s.labourId) === user.userId
    );
    return {
      escrowId: tx._id,
      amount: mySplit?.amount ?? 0,
      status: mySplit?.status ?? 'UNKNOWN',
      paidAt: tx.disbursedAt ?? tx.releasedAt,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      wallet: wallet ?? { balance: 0, pendingBalance: 0, lifetimeEarned: 0 },
      earnings,
      nextCursor: hasMore ? String(data[data.length - 1]._id) : null,
    },
  });
}
