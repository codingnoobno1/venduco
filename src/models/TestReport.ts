import mongoose, { Schema, Document } from 'mongoose'

export enum TestResult {
    PASS = 'PASS',
    FAIL = 'FAIL',
    PENDING = 'PENDING',
}

export interface ITestReport extends Document {
    inspectionId: mongoose.Types.ObjectId | string
    testType: string // Cube Test, Core Cutting, Tensile Test, etc.
    labName: string
    sampleId: string
    result: TestResult
    strengthValue?: string
    remarks?: string
    attachmentUrls?: string[]
    testedAt: Date
    createdAt: Date
    updatedAt: Date
}

const TestReportSchema = new Schema<ITestReport>(
    {
        inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
        testType: { type: String, required: true },
        labName: { type: String, required: true },
        sampleId: { type: String, required: true },
        result: {
            type: String,
            enum: Object.values(TestResult),
            default: TestResult.PENDING,
        },
        strengthValue: { type: String },
        remarks: { type: String },
        attachmentUrls: [{ type: String }],
        testedAt: { type: Date, required: true },
    },
    { timestamps: true }
)

export const TestReport = mongoose.models.TestReport || mongoose.model<ITestReport>('TestReport', TestReportSchema)
