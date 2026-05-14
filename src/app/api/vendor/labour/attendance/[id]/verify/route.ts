import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { LabourJob } from '@/models/LabourJob';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();

  const record = await Attendance.findById(id).populate('jobId');
  if (!record) {
    return NextResponse.json({ success: false, error: 'Attendance record not found' }, { status: 404 });
  }

  const job = await LabourJob.findById(record.jobId).lean() as any;
  if (!job || String(job.vendorId) !== user.userId) {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { status } = await req.json();
  if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
    return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
  }

  record.status = status;
  await record.save();

  return NextResponse.json({ success: true, data: record });
}
