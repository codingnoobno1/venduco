import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { ProjectSection, SectionStatus } from '@/models'

// GET overall project progress
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        const sections = await ProjectSection.find({ projectId }).lean()

        if (sections.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    overallProgress: 0,
                    totalLengthKm: 0,
                    completedLengthKm: 0,
                    sections: [],
                }
            })
        }

        let totalLength = 0
        let completedLength = 0
        let weightedProgress = 0

        sections.forEach(section => {
            totalLength += section.lengthKm
            if (section.status === SectionStatus.COMPLETED) {
                completedLength += section.lengthKm
                weightedProgress += section.lengthKm // 100% of length
            } else if (section.status === SectionStatus.IN_PROGRESS) {
                // We could calculate actual weighted progress from SectionProgress logs,
                // but for a quick calculation, we'll just show completed vs total.
                // If we want more detail, we'd query the latest Progress entry for this section.
            }
        })

        const overallProgressComp = totalLength > 0 ? (completedLength / totalLength) * 100 : 0

        return NextResponse.json({
            success: true,
            data: {
                overallProgress: Math.round(overallProgressComp * 100) / 100,
                totalLengthKm: totalLength,
                completedLengthKm: completedLength,
                sections: sections.map(s => ({
                    sectionCode: s.sectionCode,
                    status: s.status,
                    lengthKm: s.lengthKm,
                    fromKm: s.fromKm,
                    toKm: s.toKm
                }))
            }
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
