import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { SectionAssignment, Contract, ProjectSection, User, UserRole } from '@/models'

// GET all assignments for sections in a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        // Find all sections for this project
        const sections = await ProjectSection.find({ projectId }).select('_id')
        const sectionIds = sections.map(s => s._id)

        const assignments = await SectionAssignment.find({ sectionId: { $in: sectionIds } })
            .populate('contractId')
            .populate('sectionId')
            .lean()

        return NextResponse.json({
            success: true,
            data: assignments,
            count: assignments.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new section assignment
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
                { success: false, error: 'FORBIDDEN', message: 'Only PM/Admin can assign sections' },
                { status: 403 }
            )
        }

        await dbConnect()
        const { projectId } = await params
        const body = await request.json()
        const { contractId, sectionId, plannedStart, plannedEnd } = body

        if (!contractId || !sectionId || !plannedStart || !plannedEnd) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Contract ID, Section ID, plannedStart and plannedEnd are required' },
                { status: 400 }
            )
        }

        // Validate contract belongs to project
        const contract = await Contract.findById(contractId)
        if (!contract || String(contract.projectId) !== projectId) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Valid contract for this project not found' },
                { status: 404 }
            )
        }

        // Validate section belongs to project
        const section = await ProjectSection.findById(sectionId)
        if (!section || String(section.projectId) !== projectId) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Valid section for this project not found' },
                { status: 404 }
            )
        }

        // Check if already assigned
        const existing = await SectionAssignment.findOne({ contractId, sectionId })
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'DUPLICATE', message: 'Contract already assigned to this section' },
                { status: 409 }
            )
        }

        const assignment = await SectionAssignment.create({
            contractId,
            sectionId,
            plannedStart: new Date(plannedStart),
            plannedEnd: new Date(plannedEnd),
            status: 'ACTIVE',
        })

        return NextResponse.json(
            {
                success: true,
                data: assignment,
                message: 'Section assigned successfully',
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
