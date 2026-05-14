import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import EscrowTransaction from '@/models/EscrowTransaction';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ escrowId: string }> }
) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { escrowId } = await params;
  const { reason } = await req.json();
  if (!reason) {
    return NextResponse.json({ success: false, error: 'reason required' }, { status: 400 });
  }

  await dbConnect();

  const escrow = await EscrowTransaction.findById(escrowId);
  if (!escrow) {
    return NextResponse.json({ success: false, error: 'Escrow not found' }, { status: 404 });
  }

  if (String(escrow.vendorId) !== user.userId && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  if (!['ESCROWED', 'RELEASING'].includes(escrow.status)) {
    return NextResponse.json(
      { success: false, error: `Cannot dispute escrow in status ${escrow.status}` },
      { status: 409 }
    );
  }

  escrow.status = 'DISPUTED';
  escrow.disputeRaisedAt = new Date();
  escrow.disputeReason = reason;
  await escrow.save();

  return NextResponse.json({ success: true, data: { status: escrow.status } });
}
