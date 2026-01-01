// Project Scoped Vendors API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { ProjectMember, MemberRole, User } from '@/models'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        // Fetch members with VENDOR role for this project
        const members = await ProjectMember.find({
            projectId,
            role: MemberRole.VENDOR,
            isActive: true
        }).lean()

        // Optionally enrichment with user details if needed, 
        // but ProjectMember already has userName and userEmail

        return NextResponse.json({
            success: true,
            data: members,
            count: members.length
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
