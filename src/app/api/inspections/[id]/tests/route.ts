import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { TestReport, Inspection, TestResult, User, UserRole } from '@/models'

// GET tests for an inspection
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params

        const tests = await TestReport.find({ inspectionId: id }).sort({ testedAt: -1 }).lean()

        return NextResponse.json({ success: true, data: tests, count: tests.length })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}

// POST create new test report
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { id } = await params
        const body = await request.json()
        const { testType, labName, sampleId, result, strengthValue, remarks, attachmentUrls, testedAt } = body

        if (!testType || !labName || !sampleId || !result || !testedAt) {
            return NextResponse.json({ success: false, error: 'VALIDATION_ERROR', message: 'Missing required fields' }, { status: 400 })
        }

        const inspection = await Inspection.findById(id)
        if (!inspection) {
            return NextResponse.json({ success: false, error: 'NOT_FOUND', message: 'Inspection not found' }, { status: 404 })
        }

        // Create the test report
        const testReport = await TestReport.create({
            inspectionId: id,
            testType,
            labName,
            sampleId,
            result,
            strengthValue,
            remarks,
            attachmentUrls,
            testedAt: new Date(testedAt),
        })

        // Update inspection with the new test report
        inspection.testReportIds = inspection.testReportIds || []
        inspection.testReportIds.push(testReport._id)

        // If testing was mandatory and this is a fail, ensure visibility
        if (result === TestResult.FAIL) {
            inspection.remarks = (inspection.remarks || '') + `\n[ALERT] Test ${testType} FAILED on ${new Date(testedAt).toLocaleDateString()}`
        }

        await inspection.save()

        return NextResponse.json({ success: true, data: testReport, message: 'Test report added successfully' }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
