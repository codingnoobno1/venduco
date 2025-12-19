export const dynamic = 'force-dynamic';
// Projects API - List all & Create new
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Project, ProjectStatus } from '@/models'

// GET all projects (with filters)
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const pmId = searchParams.get('pmId')

        const query: any = {}
        if (status) query.status = status
        if (pmId) query.pmId = pmId

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: projects,
            count: projects.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new project
export async function POST(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const body = await request.json()
        // Support both 'name' and 'projectName' for compatibility
        const name = body.name || body.projectName
        const projectCode = body.projectCode
        const {
            location, address, description, startDate, endDate, deadline, budget,
            clientName, projectType, planningStatus, minExperience, requiredBrands,
            maintenancePeriod, imageUrl, departments
        } = body

        // Validation
        if (!name || !projectCode) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Project name and code are required' },
                { status: 400 }
            )
        }

        // Check duplicate code
        const existing = await Project.findOne({ projectCode: projectCode.toUpperCase() })
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'Project code already exists' },
                { status: 409 }
            )
        }

        const project = await Project.create({
            name,
            projectCode: projectCode.toUpperCase(),
            location: location || 'TBD',
            address,
            description,
            startDate: startDate ? new Date(startDate) : new Date(),
            deadline: deadline || endDate ? new Date(deadline || endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days default
            budget: budget || 0,
            clientName: clientName || 'TBD',
            projectType: projectType || 'CONSTRUCTION',
            planningStatus: planningStatus || 'IDEATION',
            minExperience,
            requiredBrands,
            maintenancePeriod,
            imageUrl,
            departments: departments || [],
            pmId: payload.userId,
            createdBy: payload.userId,
            status: ProjectStatus.PLANNING,
        })

        return NextResponse.json(
            {
                success: true,
                data: {
                    projectId: project._id,
                    projectCode: project.projectCode,
                    status: project.status,
                },
                message: 'Project created successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
