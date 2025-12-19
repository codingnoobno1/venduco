// Collaborators API - List and invite PM collaborators
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Project } from '@/models/Project'
import {
    ProjectCollaborator,
    CollaboratorRole,
    CollaboratorStatus,
    DEFAULT_COLLABORATOR_PERMISSIONS
} from '@/models/ProjectCollaborator'
import { User } from '@/models/User'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET list collaborators for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const project = await Project.findById(projectId).select('pmId name pmName').lean()
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        const collaborators = await ProjectCollaborator.find({
            projectId,
            status: { $in: [CollaboratorStatus.PENDING, CollaboratorStatus.ACCEPTED] }
        }).sort({ role: 1, acceptedAt: -1 }).lean()

        // Include the admin PM (creator) in the list
        const adminPM = {
            userId: project.pmId,
            userName: project.pmName || 'Project Manager',
            role: CollaboratorRole.ADMIN_PM,
            status: CollaboratorStatus.ACCEPTED,
            isCreator: true,
        }

        return NextResponse.json({
            success: true,
            data: {
                adminPM,
                collaborators,
            },
            count: collaborators.length + 1,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST invite a new collaborator PM
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params
        const body = await request.json()
        const { userId, message, permissions, suggestedBy } = body

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'INVALID', message: 'User ID is required' },
                { status: 400 }
            )
        }

        const project = await Project.findById(projectId)
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Project not found' },
                { status: 404 }
            )
        }

        // Only admin PM can invite
        if (project.pmId !== payload.userId && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only admin PM can invite collaborators' },
                { status: 403 }
            )
        }

        // Get user to invite
        const userToInvite = await User.findById(userId).select('name email requestedRole').lean()
        if (!userToInvite) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        if (userToInvite.requestedRole !== 'PROJECT_MANAGER') {
            return NextResponse.json(
                { success: false, error: 'INVALID', message: 'User must be a Project Manager' },
                { status: 400 }
            )
        }

        // Check for existing invitation
        const existing = await ProjectCollaborator.findOne({ projectId, userId })
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'User already invited' },
                { status: 400 }
            )
        }

        // Get inviter details
        const inviter = await User.findById(payload.userId).select('name').lean()

        // Get suggester details if suggested
        let suggestedByName
        if (suggestedBy) {
            const suggester = await User.findById(suggestedBy).select('name').lean()
            suggestedByName = suggester?.name
        }

        const collaborator = await ProjectCollaborator.create({
            projectId,
            projectName: project.name,
            userId,
            userName: userToInvite.name,
            userEmail: userToInvite.email,
            role: CollaboratorRole.COLLABORATOR_PM,
            permissions: permissions || DEFAULT_COLLABORATOR_PERMISSIONS,
            invitedBy: payload.userId,
            invitedByName: inviter?.name || 'Unknown',
            inviteMessage: message,
            status: CollaboratorStatus.PENDING,
            suggestedBy,
            suggestedByName,
        })

        return NextResponse.json({
            success: true,
            data: {
                collaboratorId: collaborator._id,
                userName: userToInvite.name,
                status: collaborator.status,
            },
            message: 'PM invited as collaborator',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
