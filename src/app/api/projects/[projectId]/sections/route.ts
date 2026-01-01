import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { ProjectSection, SectionStatus, User, UserRole } from '@/models'

// GET all sections for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const sections = await ProjectSection.find({ projectId }).sort({ fromKm: 1 }).lean()

        return NextResponse.json({
            success: true,
            data: sections,
            count: sections.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new section
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        const user = await User.findById(payload.userId).select('requestedRole').lean()
        if (user?.requestedRole !== UserRole.PROJECT_MANAGER && user?.requestedRole !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Only PM/Admin can create sections' },
                { status: 403 }
            )
        }

        await dbConnect()
        const { projectId } = await params
        const body = await request.json()
        const { sectionCode, fromKm, toKm, description } = body

        if (!sectionCode || fromKm === undefined || toKm === undefined) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Section code, fromKm and toKm are required' },
                { status: 400 }
            )
        }

        const lengthKm = Math.abs(toKm - fromKm)

        // Check for duplicate code in same project
        const existing = await ProjectSection.findOne({ projectId, sectionCode: sectionCode.trim() })
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'Section code already exists for this project' },
                { status: 409 }
            )
        }

        const section = await ProjectSection.create({
            projectId,
            sectionCode: sectionCode.trim(),
            fromKm,
            toKm,
            lengthKm,
            status: SectionStatus.NOT_STARTED,
            description,
        })

        return NextResponse.json(
            {
                success: true,
                data: section,
                message: 'Project section created successfully',
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
