import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { calculateAndLog } from '@/lib/pricing';
import { getGateway } from '@/lib/payment-gateway';
import dbConnect from '@/lib/db';
import EscrowTransaction from '@/models/EscrowTransaction';
import Invoice from '@/models/Invoice';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { invoiceId, workerCount, days, vendorTier } = await req.json();
  if (!invoiceId) {
    return NextResponse.json({ success: false, error: 'invoiceId required' }, { status: 400 });
  }

  await dbConnect();

  const invoice = await Invoice.findById(invoiceId).lean() as any;
  if (!invoice) {
    return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
  }
  if (String(invoice.vendorId ?? invoice.createdBy) !== user.userId) {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const existing = await EscrowTransaction.findOne({ invoiceId }).lean();
  if (existing) {
    return NextResponse.json({ success: false, error: 'Payment already initiated for this invoice' }, { status: 409 });
  }

  const breakdown = await calculateAndLog({
    totalAmount: invoice.totalAmount ?? invoice.amount,
    vendorId: user.userId,
    invoiceId,
    workerCount,
    days,
    vendorTier,
  });

  const gateway = await getGateway();
  const receiptId = `rcpt_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  const order = await gateway.createOrder({
    amount: Math.round(breakdown.vendorTotalCharge * 100),
    currency: 'INR',
    receiptId,
    notes: { invoiceId: String(invoiceId), vendorId: user.userId },
  });

  const escrow = await EscrowTransaction.create({
    invoiceId,
    vendorId: user.userId,
    grossAmount: breakdown.baseAmount,
    platformFee: breakdown.feeAmount,
    platformGST: breakdown.gstOnFee,
    netPayable: breakdown.netPayable,
    gatewayName: gateway.name,
    orderId: order.gatewayOrderId,
    status: 'PENDING_PAYMENT',
  });

  return NextResponse.json({
    success: true,
    data: {
      escrowId: escrow._id,
      orderId: order.gatewayOrderId,
      amount: order.amount,
      currency: order.currency,
      gateway: gateway.name,
      breakdown,
    },
  });
}
