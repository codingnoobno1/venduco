import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import EscrowTransaction from '@/models/EscrowTransaction';
import RevenueEvent from '@/models/RevenueEvent';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  await dbConnect();

  const [escrowStats, revenueEvents] = await Promise.all([
    EscrowTransaction.aggregate([
      { $match: { vendorId: user.userId } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$grossAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
    RevenueEvent.aggregate([
      { $match: { vendorId: user.userId } },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$feeAmount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]),
  ]);

  const byStatus: Record<string, { total: number; count: number }> = {};
  for (const s of escrowStats) {
    byStatus[s._id] = { total: s.total, count: s.count };
  }

  return NextResponse.json({
    success: true,
    data: {
      byStatus,
      totalFeesPaid: revenueEvents[0]?.totalFees ?? 0,
      totalTransactions: revenueEvents[0]?.totalTransactions ?? 0,
    },
  });
}
