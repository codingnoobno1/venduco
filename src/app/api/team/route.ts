export const dynamic = 'force-static';
// Team API - Get all team members for PM's projects
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectMember, User, Project } from '@/models'
import jwt from 'jsonwebtoken'

function verifyToken(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
        return decoded
    } catch {
        return null
    }
}

export async function GET(req: NextRequest) {
    await dbConnect()

    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    try {
        // First get all projects where user is PM
        const projects = await Project.find({
            pmId: user.id || user.userId,
            deletedAt: { $exists: false }
        }).select('_id name projectCode').lean()

        const projectIds = projects.map(p => p._id.toString())
        const projectMap = new Map(projects.map(p => [p._id.toString(), { name: p.name, code: p.projectCode }]))

        if (projectIds.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                message: 'No projects found'
            })
        }

        // Get all project members for these projects
        const members = await ProjectMember.find({
            projectId: { $in: projectIds },
            status: { $in: ['ACTIVE', 'APPROVED'] }
        }).lean()

        // Get user details for each member
        const userIds = [...new Set(members.map(m => m.userId))]
        const users = await User.find({ _id: { $in: userIds } })
            .select('name email phone role company registrationStatus')
            .lean()
        const userMap = new Map(users.map(u => [u._id.toString(), u]))

        // Build team data
        const teamData = members.map(member => {
            const userData = userMap.get(member.userId.toString())
            const projectData = projectMap.get(member.projectId.toString())

            return {
                _id: member._id,
                userId: member.userId,
                name: (userData as any)?.name || 'Unknown',
                email: (userData as any)?.email || '',
                phone: (userData as any)?.phone || '',
                company: (userData as any)?.company || '',
                role: member.role || (userData as any)?.role || 'MEMBER',
                projectId: member.projectId,
                projectName: projectData?.name || 'Unknown Project',
                projectCode: projectData?.code || '',
                status: member.status,
                joinedAt: member.createdAt,
            }
        })

        // Group by user to avoid duplicates if same user in multiple projects
        const uniqueTeam = Array.from(
            teamData.reduce((map, item) => {
                const existing = map.get(item.userId?.toString())
                if (!existing) {
                    map.set(item.userId?.toString(), item)
                } else {
                    // User is in multiple projects, append project info
                    existing.projectName = `${existing.projectName}, ${item.projectName}`
                }
                return map
            }, new Map()).values()
        )

        return NextResponse.json({
            success: true,
            data: uniqueTeam,
            count: uniqueTeam.length,
        })
    } catch (error) {
        console.error('Team API error:', error)
        return NextResponse.json({ success: false, message: 'Failed to fetch team' }, { status: 500 })
    }
}
