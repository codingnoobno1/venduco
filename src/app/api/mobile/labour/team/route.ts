/**
 * GET /api/mobile/labour/team?teamId=<id>
 *
 * Returns team details + populated member list for the MitrContract mobile app.
 * No auth required — workers need to see their team even before logging in fully.
 */
import { NextResponse } from 'next/server';
import { LabourTeam } from '@/models';
import dbConnect from '@/lib/db';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { success: false, message: 'teamId is required' },
        { status: 400 }
      );
    }

    const team = await LabourTeam.findById(teamId)
      .populate('leaderId', 'name phone city labourSkills')
      .populate('memberIds', 'name phone city labourSkills isAvailable')
      .lean();

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: team._id,
        name: (team as any).name,
        projectLocation: (team as any).projectLocation ?? '',
        leaderId: (team as any).leaderId,
        memberIds: (team as any).memberIds ?? [],
        members: (team as any).memberIds ?? [], // alias for mobile client
        createdAt: (team as any).createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
