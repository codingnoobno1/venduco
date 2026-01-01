import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { SectionProgress, ProjectSection, SectionAssignment, SectionStatus, Contract, ProgressStatus, BOQItem, EngineeringTask } from '@/models'

// GET progress for sections in a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params
        const { searchParams } = new URL(request.url)
        const sectionId = searchParams.get('sectionId')

        const query: any = {}
        if (sectionId) {
            query.sectionId = sectionId
        } else {
            // Find all sections for this project
            const sections = await ProjectSection.find({ projectId }).select('_id')
            query.sectionId = { $in: sections.map(s => s._id) }
        }

        const progress = await SectionProgress.find(query)
            .sort({ date: -1 })
            .populate('verifiedBy', 'name')
            .lean()

        return NextResponse.json({
            success: true,
            data: progress,
            count: progress.length,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// POST create new progress entry
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
        const { sectionId, taskId, contractId, date, workType, quantityDone, unit, progressPercent, remarks, evidencePhotos, resourceUsage } = body

        // 1. Basic Validation
        if (!sectionId || !contractId || !workType || quantityDone === undefined || progressPercent === undefined) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // 2. Validate Section & Assignment
        const section = await ProjectSection.findById(sectionId)
        if (!section || String(section.projectId) !== projectId) {
            return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Section not found' }, { status: 404 })
        }

        const assignment = await SectionAssignment.findOne({ sectionId, contractId, status: 'ACTIVE' })
        if (!assignment) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'You are not assigned to this section' },
                { status: 403 }
            )
        }

        // 3. BOQ & Task Validation
        if (taskId) {
            const task = await EngineeringTask.findById(taskId)
            if (!task) {
                return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Engineering Task not found' }, { status: 404 })
            }

            // If task is linked to a BOQ, validate quantities
            if (task.boqItemId) {
                const boq = await BOQItem.findById(task.boqItemId)
                if (boq) {
                    if (boq.consumedQuantity + quantityDone > boq.totalQuantity) {
                        return NextResponse.json({
                            success: false,
                            error: 'BOQ_LIMIT_EXCEEDED',
                            message: `Proposed quantity (${quantityDone}) exceeds the remaining BOQ limit (${boq.totalQuantity - boq.consumedQuantity} ${boq.unit} left).`
                        }, { status: 400 })
                    }

                    // Increment BOQ consumption
                    boq.consumedQuantity += quantityDone
                    await boq.save()
                }
            }
        }

        // 3. Route Continuity Logic
        // If the user attempts to mark progress as 100% or significant, check previous section
        if (progressPercent >= 100) {
            const previousSection = await ProjectSection.findOne({
                projectId,
                toKm: { $lte: section.fromKm },
                _id: { $ne: section._id }
            }).sort({ toKm: -1 })

            if (previousSection && previousSection.status !== SectionStatus.COMPLETED) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'CONTINUITY_ERROR',
                        message: `Cannot complete section ${section.sectionCode} because the previous section ${previousSection.sectionCode} is not completed.`
                    },
                    { status: 409 }
                )
            }
        }

        // 4. Create Progress Log
        const progress = await SectionProgress.create({
            sectionId,
            taskId,
            contractId,
            date: date ? new Date(date) : new Date(),
            workType,
            quantityDone,
            unit,
            progressPercent,
            remarks,
            evidencePhotos,
            resourceUsage,
            status: ProgressStatus.SUBMITTED, // Default to submitted for PM review
        })

        // 5. Update Section Status
        if (section.status === SectionStatus.NOT_STARTED) {
            section.status = SectionStatus.IN_PROGRESS
            await section.save()
        }

        // If progress is 100%, we might update status here, but usually it needs verification
        // For now, only PM verification should mark it as COMPLETED

        return NextResponse.json(
            {
                success: true,
                data: progress,
                message: 'Progress entry submitted for verification',
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
