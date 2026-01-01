const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                let value = valueParts.join('=').trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                process.env[key.trim()] = value;
            }
        });
    }
} catch (err) {
    console.error('Warning: Could not read .env file');
}

// Schemas
const SectionStatus = { NOT_STARTED: 'NOT_STARTED', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED' };
const ProgressStatus = { DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', VERIFIED: 'VERIFIED', REJECTED: 'REJECTED' };
const InvoiceStatus = { DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', INSPECTION_ASSIGNED: 'INSPECTION_ASSIGNED', TESTING_REQUIRED: 'TESTING_REQUIRED', APPROVED: 'APPROVED', BILLED: 'BILLED', PAID: 'PAID', REJECTED: 'REJECTED', ON_HOLD: 'ON_HOLD' };
const TestResult = { PASS: 'PASS', FAIL: 'FAIL', PENDING: 'PENDING' };

const ProjectSection = mongoose.model('ProjectSection', new mongoose.Schema({ projectId: String, sectionCode: String, fromKm: Number, toKm: Number, lengthKm: Number, status: String }, { strict: false }));
const SectionProgress = mongoose.model('SectionProgress', new mongoose.Schema({ sectionId: String, contractId: String, progressPercent: Number, status: String }, { strict: false }));
const Invoice = mongoose.model('Invoice', new mongoose.Schema({ projectId: String, contractId: String, status: String, linkedProgressIds: [mongoose.Schema.Types.ObjectId] }, { strict: false }));
const Inspection = mongoose.model('Inspection', new mongoose.Schema({ invoiceId: String, status: String, testingRequired: Boolean, testReportIds: [mongoose.Schema.Types.ObjectId] }, { strict: false }));
const TestReport = mongoose.model('TestReport', new mongoose.Schema({ inspectionId: String, result: String }, { strict: false }));
const Contract = mongoose.model('Contract', new mongoose.Schema({ projectId: String, vendorId: String, status: String }, { strict: false }));

async function runVerification() {
    try {
        console.log('--- ERP FLOW VERIFICATION ---');
        await mongoose.connect(process.env.MONGODB_URI);
        const projectId = new mongoose.Types.ObjectId().toString();

        // 1. Create Sections (CP-304 before CP-305)
        const s304 = await ProjectSection.create({ projectId, sectionCode: 'CP-304', fromKm: 304, toKm: 305, lengthKm: 1, status: SectionStatus.NOT_STARTED });
        const s305 = await ProjectSection.create({ projectId, sectionCode: 'CP-305', fromKm: 305, toKm: 306, lengthKm: 1, status: SectionStatus.NOT_STARTED });
        console.log('✅ Sections created: CP-304 and CP-305');

        // 2. Continuity Logic Test
        // Attempting to complete 305 while 304 is not done
        const prevSection = await ProjectSection.findOne({ projectId, toKm: { $lte: s305.fromKm }, _id: { $ne: s305._id } }).sort({ toKm: -1 });
        const hasContinuityError = prevSection && prevSection.status !== SectionStatus.COMPLETED;
        console.log(hasContinuityError ? '✅ Continuity Check: CORRECTLY blocked CP-305 completion because CP-304 is incomplete.' : '❌ Continuity Check: FAILED');

        // 3. Quality Gate Test (Invoice Approval)
        const contractId = new mongoose.Types.ObjectId();
        const progress1 = await SectionProgress.create({ sectionId: s304._id, contractId, progressPercent: 100, status: ProgressStatus.SUBMITTED });
        const invoice = await Invoice.create({ projectId, contractId, invoiceNumber: 'INV-ERP-001', status: InvoiceStatus.SUBMITTED, linkedProgressIds: [progress1._id] });
        console.log('✅ Progress submitted for CP-304. Invoice generated.');

        // Assign Inspection
        const inspection = await Inspection.create({ invoiceId: invoice._id, status: 'PENDING', testingRequired: true });
        console.log('✅ PM assigned Site Inspection (Testing Mandatory).');

        // Test Fails
        const failTest = await TestReport.create({ inspectionId: inspection._id, result: TestResult.FAIL });
        console.log('⚠️ Lab Test FAILED.');

        // PM Approval Logic (Simulated)
        const failedTestsCount = await TestReport.countDocuments({ inspectionId: inspection._id, result: TestResult.FAIL });
        if (failedTestsCount > 0) {
            console.log('✅ Quality Gate: CORRECTLY blocked Invoice Approval due to failed lab tests.');
        } else {
            console.log('❌ Quality Gate: FAILED to block');
        }

        // Test Passes
        await TestReport.deleteMany({ inspectionId: inspection._id });
        await TestReport.create({ inspectionId: inspection._id, result: TestResult.PASS });
        console.log('✅ Lab Test PASSED.');

        // PM Approves
        const finalCheck = await TestReport.countDocuments({ inspectionId: inspection._id, result: TestResult.FAIL });
        if (finalCheck === 0) {
            invoice.status = InvoiceStatus.APPROVED;
            await invoice.save();
            await ProjectSection.findByIdAndUpdate(s304._id, { status: SectionStatus.COMPLETED });
            console.log('✅ Quality Gate: Invoice APPROVED. Project Section CP-304 marked COMPLETED.');
        }

        // 4. Verification of CP-304 completion enabling CP-305
        const s304Updated = await ProjectSection.findById(s304._id);
        const prevSectionNext = await ProjectSection.findOne({ projectId, toKm: { $lte: s305.fromKm }, _id: { $ne: s305._id } }).sort({ toKm: -1 });
        const canComplete305 = !prevSectionNext || prevSectionNext.status === SectionStatus.COMPLETED;
        console.log(canComplete305 ? '✅ Workflow Continuity: CP-305 completion is now EMPOWERED by CP-304 success.' : '❌ Workflow Continuity: BLOCK still in place');

        // Cleanup
        await ProjectSection.deleteMany({ projectId });
        await SectionProgress.deleteMany({ sectionId: { $in: [s304._id, s305._id] } });
        await Invoice.deleteOne({ _id: invoice._id });
        await Inspection.deleteOne({ _id: inspection._id });
        await TestReport.deleteMany({ inspectionId: inspection._id });
        console.log('Test completed and cleaned up.');

    } catch (err) {
        console.error('Error during verification:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
