import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getGateway } from '@/lib/payment-gateway';
import dbConnect from '@/lib/db';
import EscrowTransaction from '@/models/EscrowTransaction';
import WorkerWallet from '@/models/WorkerWallet';
import type { WorkerSplit } from '@/models/EscrowTransaction';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ escrowId: string }> }
) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { escrowId } = await params;
  await dbConnect();

  const escrow = await EscrowTransaction.findById(escrowId);
  if (!escrow) {
    return NextResponse.json({ success: false, error: 'Escrow not found' }, { status: 404 });
  }

  const isOwner = String(escrow.vendorId) === user.userId;
  const isAdmin = user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  if (escrow.status !== 'ESCROWED') {
    return NextResponse.json(
      { success: false, error: `Cannot release escrow in status ${escrow.status}` },
      { status: 409 }
    );
  }

  escrow.status = 'RELEASING';
  await escrow.save();

  const gateway = await getGateway();
  const results: { labourId: unknown; status: string }[] = [];

  for (const split of escrow.workerSplits as WorkerSplit[]) {
    try {
      const payout = await gateway.initiatePayout({
        payoutId: String(split.labourId),
        upiId: split.upiId,
        amount: Math.round(split.amount * 100),
        purpose: 'Labour wage payout',
        referenceId: `${escrow._id}_${split.labourId}`,
      });

      split.payoutId = payout.gatewayPayoutId;
      split.status = payout.status === 'PAID' ? 'PAID' : 'INITIATED';

      await WorkerWallet.findOneAndUpdate(
        { userId: split.labourId },
        {
          $inc: {
            balance: payout.status === 'PAID' ? split.amount : 0,
            pendingBalance: payout.status === 'INITIATED' ? split.amount : 0,
            lifetimeEarned: split.amount,
          },
        },
        { upsert: true }
      );

      results.push({ labourId: split.labourId, status: split.status });
    } catch {
      split.status = 'FAILED';
      results.push({ labourId: split.labourId, status: 'FAILED' });
    }
  }

  const allPaid = (escrow.workerSplits as WorkerSplit[]).every(s => s.status === 'PAID');
  escrow.status = allPaid ? 'DISBURSED' : 'RELEASED';
  escrow.releasedAt = new Date();
  if (allPaid) escrow.disbursedAt = new Date();
  await escrow.save();

  return NextResponse.json({ success: true, data: { status: escrow.status, payouts: results } });
}
