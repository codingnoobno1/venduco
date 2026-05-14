import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EscrowTransaction from '@/models/EscrowTransaction';

// Razorpay/Cashfree will POST signed events here.
// In DUMMY mode the dummy-payment page calls /api/payments/initiate directly
// and skips this webhook entirely.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event, payload } = body;

  await dbConnect();

  if (event === 'payment.captured') {
    const razorpayOrderId = payload?.payment?.entity?.order_id;
    if (!razorpayOrderId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const escrow = await EscrowTransaction.findOne({ orderId: razorpayOrderId });
    if (!escrow || escrow.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ success: true }); // idempotent
    }

    escrow.status = 'ESCROWED';
    escrow.paymentId = payload?.payment?.entity?.id ?? '';
    escrow.escrowedAt = new Date();
    escrow.releaseAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await escrow.save();

    return NextResponse.json({ success: true });
  }

  // Unhandled event — still return 200 so gateway doesn't retry
  return NextResponse.json({ success: true, note: 'event not handled' });
}
