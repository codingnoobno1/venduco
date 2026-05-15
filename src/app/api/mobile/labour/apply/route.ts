import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { LabourApplication, LabourJob } from '@/models';
import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', message: 'Session expired or invalid' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { jobId, bidAmount, message } = body;

    if (!jobId || !bidAmount) {
      return NextResponse.json(
        { success: false, error: 'BAD_REQUEST', message: 'jobId and bidAmount are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if job exists and is open
    const job = await LabourJob.findById(jobId);
    if (!job) {
       return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Job not found' }, { status: 404 });
    }
    if (job.status !== 'OPEN') {
       return NextResponse.json({ success: false, error: 'CLOSED', message: 'This job is no longer accepting applications' }, { status: 400 });
    }

    const existing = await LabourApplication.findOne({ jobId, labourId: user.userId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'ALREADY_APPLIED', message: 'You have already applied for this job' },
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

    console.log(`Application created: ${application._id} for job ${jobId} by user ${user.userId}`);

    return NextResponse.json({ 
      success: true, 
      data: { applicationId: application._id },
      message: 'Application submitted successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Apply Job Error:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
