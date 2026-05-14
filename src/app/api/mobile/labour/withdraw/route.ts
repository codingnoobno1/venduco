import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getGateway } from '@/lib/payment-gateway';
import dbConnect from '@/lib/db';
import WorkerWallet from '@/models/WorkerWallet';

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { amount, upiId } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ success: false, error: 'amount must be positive' }, { status: 400 });
  }

  await dbConnect();

  const wallet = await WorkerWallet.findOne({ userId: user.userId });
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
  }

  const targetUpi = upiId || wallet.defaultUpiId;
  if (!targetUpi) {
    return NextResponse.json({ success: false, error: 'No UPI ID on file. Update wallet first.' }, { status: 400 });
  }

  if (wallet.balance < amount) {
    return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
  }

  if (amount > wallet.dailyWithdrawalLimit) {
    return NextResponse.json(
      { success: false, error: `Exceeds daily withdrawal limit of ₹${wallet.dailyWithdrawalLimit}` },
      { status: 400 }
    );
  }

  const gateway = await getGateway();
  const payout = await gateway.initiatePayout({
    payoutId: user.userId,
    upiId: targetUpi,
    amount: Math.round(amount * 100),
    purpose: 'Worker wallet withdrawal',
    referenceId: `withdraw_${user.userId}_${Date.now()}`,
  });

  await WorkerWallet.findOneAndUpdate(
    { userId: user.userId },
    {
      $inc: {
        balance: -amount,
        lifetimeWithdrawn: amount,
      },
    }
  );

  return NextResponse.json({
    success: true,
    data: {
      payoutId: payout.gatewayPayoutId,
      status: payout.status,
      amount,
      upiId: targetUpi,
    },
  });
}
