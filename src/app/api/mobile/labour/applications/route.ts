import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';
import { LabourApplication } from '@/models';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    await dbConnect();

    // Fetch applications for this labourer, populate job details
    const applications = await LabourApplication.find({ labourId: user.userId })
      .populate('jobId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    console.error('Fetch Applications Error:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
