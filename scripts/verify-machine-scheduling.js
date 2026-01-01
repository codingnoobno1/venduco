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
                // Strip quotes if they exist
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                process.env[key.trim()] = value;
            }
        });
    }
} catch (err) {
    console.error('Warning: Could not read .env file');
}

// Simple Schema definitions for verification
const RentalStatus = {
    AVAILABLE: 'AVAILABLE',
    REQUESTED: 'REQUESTED',
    APPROVED: 'APPROVED',
    ASSIGNED: 'ASSIGNED',
    IN_USE: 'IN_USE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

const MachineRentalSchema = new mongoose.Schema({
    machineId: String,
    status: String,
    requestedStartDate: Date,
    requestedEndDate: Date,
}, { strict: false });

const MachineAssignmentSchema = new mongoose.Schema({
    machineId: String,
    status: String,
    fromDate: Date,
    toDate: Date,
}, { strict: false });

const MachineRental = mongoose.models.MachineRental || mongoose.model('MachineRental', MachineRentalSchema);
const MachineAssignment = mongoose.models.MachineAssignment || mongoose.model('MachineAssignment', MachineAssignmentSchema);

async function verifyScheduling() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const machineId = new mongoose.Types.ObjectId().toString();

        // 1. Create a committed rental (REQUESTED)
        const activeRental = await MachineRental.create({
            machineId,
            status: RentalStatus.REQUESTED,
            requestedStartDate: new Date('2026-02-01'),
            requestedEndDate: new Date('2026-02-10'),
            machineCode: 'TEST-001',
            machineName: 'Test Machine',
            machineType: 'TRUCK',
            vendorId: 'test-vendor',
            vendorName: 'Test Vendor',
            vendorEmail: 'test@test.com',
            dailyRate: 1000,
            location: 'London'
        });
        console.log('Created active rental for Feb 1 to Feb 10');

        // 2. Test overlapping ranges
        const testRanges = [
            { start: '2026-01-25', end: '2026-02-05', expected: true, label: 'Starts before, ends halfway' },
            { start: '2026-02-05', end: '2026-02-15', expected: true, label: 'Starts halfway, ends after' },
            { start: '2026-02-02', end: '2026-02-08', expected: true, label: 'Fully inside' },
            { start: '2026-01-20', end: '2026-02-20', expected: true, label: 'Fully covers' },
            { start: '2026-01-15', end: '2026-01-30', expected: false, label: 'No overlap (Before)' },
            { start: '2026-02-15', end: '2026-02-25', expected: false, label: 'No overlap (After)' },
        ];

        for (const range of testRanges) {
            const start = new Date(range.start);
            const end = new Date(range.end);

            const conflict = await MachineRental.findOne({
                machineId,
                status: { $in: [RentalStatus.REQUESTED, RentalStatus.APPROVED, RentalStatus.ASSIGNED, RentalStatus.IN_USE] },
                requestedStartDate: { $lt: end },
                requestedEndDate: { $gt: start }
            });

            const hasConflict = !!conflict;
            const success = hasConflict === range.expected;
            console.log(`${success ? '✅' : '❌'} ${range.label}: [${range.start} to ${range.end}] -> Conflict? ${hasConflict} (Expected: ${range.expected})`);
        }

        // Cleanup
        await MachineRental.deleteOne({ _id: activeRental._id });
        console.log('Test completed and cleaned up.');

    } catch (err) {
        console.error('Error during verification:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyScheduling();
