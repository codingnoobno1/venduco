export const dynamic = 'force-dynamic';
// Issues API - CRUD for project issues
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Project } from '@/models'
import mongoose from 'mongoose'

// Issue Model
const IssueSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    projectName: String,
    title: { type: String, required: true },
    description: String,
    category: {
        type: String,
        enum: ['DELAY', 'MATERIAL', 'MACHINE', 'LABOUR', 'WEATHER', 'SAFETY', 'OTHER'],
        default: 'OTHER'
    },
    priority: {
        type: String,
        enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
        default: 'NORMAL'
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },
    reporterId: { type: String, required: true },
    reporterName: String,
    assignedTo: String,
    assignedToName: String,
    resolution: String,
    resolvedAt: Date,
}, { timestamps: true })

IssueSchema.index({ projectId: 1, status: 1 })
IssueSchema.index({ reporterId: 1 })

const Issue = mongoose.models.Issue || mongoose.model('Issue', IssueSchema)

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')

        let query: any = {}

        // If projectId specified, filter by it
        if (projectId) {
            query.projectId = projectId
        } else {
            // Get PM's projects and their issues
            const projects = await Project.find({ pmId: payload.userId }).select('_id').lean()
            const projectIds = projects.map(p => p._id)
            query = {
                $or: [
                    { projectId: { $in: projectIds } },
                    { reporterId: payload.userId }
                ]
            }
        }

        const issues = await Issue.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: issues,
            count: issues.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        const { projectId, title, description, category, priority } = body

        if (!projectId || !title) {
            return NextResponse.json(
                { success: false, message: 'Project and title are required' },
                { status: 400 }
            )
        }

        // Get project name
        const project = await Project.findById(projectId).select('name').lean()

        const issue = await Issue.create({
            projectId,
            projectName: (project as any)?.name || 'Unknown',
            title,
            description,
            category: category || 'OTHER',
            priority: priority || 'NORMAL',
            status: 'OPEN',
            reporterId: payload.userId,
            reporterName: payload.name || 'User',
        })

        return NextResponse.json({
            success: true,
            data: issue,
            message: 'Issue reported successfully',
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
