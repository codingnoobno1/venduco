import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { LabourJob } from '@/models/LabourJob';

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  const date = searchParams.get('date');

  await dbConnect();

  // Find jobs belonging to this vendor
  const jobFilter: Record<string, unknown> = { vendorId: user.userId };
  if (jobId) jobFilter._id = jobId;
  const vendorJobIds = await LabourJob.find(jobFilter).select('_id').lean();
  const ids = vendorJobIds.map((j: any) => j._id);

  const attendanceFilter: Record<string, unknown> = { jobId: { $in: ids } };
  if (date) {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(date);
    to.setHours(23, 59, 59, 999);
    attendanceFilter['checkIn.time'] = { $gte: from, $lte: to };
  }

  const records = await Attendance.find(attendanceFilter)
    .sort({ 'checkIn.time': -1 })
    .lean();

  return NextResponse.json({ success: true, data: records });
}
