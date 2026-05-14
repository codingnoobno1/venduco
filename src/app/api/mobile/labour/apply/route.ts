import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { LabourApplication } from '@/models';
import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await req.json();
  const { jobId, bidAmount, message } = body;

  if (!jobId || !bidAmount) {
    return NextResponse.json(
      { success: false, error: 'jobId and bidAmount are required' },
      { status: 400 }
    );
  }

  await dbConnect();

  const existing = await LabourApplication.findOne({ jobId, labourId: user.userId });
  if (existing) {
    return NextResponse.json(
      { success: false, error: 'Already applied for this job' },
      { status: 409 }
    );
  }

  const application = await LabourApplication.create({
    jobId,
    labourId: user.userId,
    bidAmount,
    message,
    status: 'PENDING',
  });

  return NextResponse.json({ success: true, data: { applicationId: application._id } }, { status: 201 });
}
