import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RevenueEvent from '@/models/RevenueEvent';
import EscrowTransaction from '@/models/EscrowTransaction';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const excludeDummy = searchParams.get('excludeDummy') === 'true';

  await dbConnect();

  const eventFilter: Record<string, unknown> = {};
  if (excludeDummy) eventFilter.isDummyTransaction = false;

  const [eventStats, escrowStats] = await Promise.all([
    RevenueEvent.aggregate([
      { $match: eventFilter },
      {
        $group: {
          _id: '$type',
          totalFee: { $sum: '$feeAmount' },
          count: { $sum: 1 },
          totalBase: { $sum: '$baseAmount' },
        },
      },
    ]),
    EscrowTransaction.aggregate([
      {
        $group: {
          _id: '$status',
          totalGross: { $sum: '$grossAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalRevenue = eventStats.reduce((acc: number, s: any) => acc + s.totalFee, 0);
  const totalVolume = eventStats.reduce((acc: number, s: any) => acc + s.totalBase, 0);

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      byType: eventStats,
      escrowByStatus: escrowStats,
    },
  });
}
