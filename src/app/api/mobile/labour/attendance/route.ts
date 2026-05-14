import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { LabourJob } from '@/models/LabourJob';

const GEOFENCE_RADIUS_M = 250;

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await req.json();
  const {
    jobId,
    type, // 'CHECK_IN' | 'CHECK_OUT'
    lat,
    lng,
    address,
    isMockLocation,
    shift = 'DAY',
    timestamp,
  } = body;

  if (!jobId || !type || lat == null || lng == null) {
    return NextResponse.json(
      { success: false, error: 'jobId, type, lat, lng required' },
      { status: 400 }
    );
  }

  await dbConnect();

  const job = await LabourJob.findById(jobId).lean() as any;
  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
  }

  const checkTime = timestamp ? new Date(timestamp) : new Date();
  const locationPayload = { lat, lng, address: address ?? '' };

  // GPS spoofing flag — flagged but not rejected so offline queue still works
  const flags: string[] = [];
  if (isMockLocation) flags.push('MOCK_LOCATION');

  // Geofence check — flagged if worker is too far, not blocked
  if (job.geoLat != null && job.geoLng != null) {
    const dist = haversineMetres(lat, lng, job.geoLat, job.geoLng);
    if (dist > GEOFENCE_RADIUS_M) flags.push('OUTSIDE_GEOFENCE');
  }

  if (type === 'CHECK_IN') {
    const existing = await Attendance.findOne({
      labourId: user.userId,
      jobId,
      'checkOut.time': { $exists: false },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Already checked in' }, { status: 409 });
    }

    const record = await Attendance.create({
      labourId: user.userId,
      jobId,
      checkIn: { time: checkTime, location: locationPayload },
      shift,
      status: 'PRESENT',
    });

    return NextResponse.json({ success: true, data: { attendanceId: record._id, flags } });
  }

  if (type === 'CHECK_OUT') {
    const record = await Attendance.findOneAndUpdate(
      { labourId: user.userId, jobId, 'checkOut.time': { $exists: false } },
      { $set: { 'checkOut.time': checkTime, 'checkOut.location': locationPayload } },
      { new: true }
    );

    if (!record) {
      return NextResponse.json({ success: false, error: 'No active check-in found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { attendanceId: record._id, flags } });
  }

  return NextResponse.json({ success: false, error: 'type must be CHECK_IN or CHECK_OUT' }, { status: 400 });
}
