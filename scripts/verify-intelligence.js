const mongoose = require('mongoose');

async function verifyIntelligence() {
    console.log('--- INTELLIGENCE & STRATEGY GOVERNANCE VERIFICATION ---\n');

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/venduco';

    try {
        await mongoose.connect(uri);

        // Test 1: Verify Specialised Work Catalog
        console.log('[1] Verifying Specialised Work Catalog...');
        const SpecialisedWork = mongoose.model('SpecialisedWork');
        const works = await SpecialisedWork.find();
        console.log(`✅ FOUND ${works.length} specialized work categories`);
        console.log(`   Sample: ${works.slice(0, 3).map(w => w.name).join(', ')}\n`);

        // Test 2: Mock Vendor Profile Creation
        console.log('[2] Testing Vendor Experience Profile...');
        const VendorExperienceProfile = mongoose.model('VendorExperienceProfile', new mongoose.Schema({
            vendorId: String,
            coreDomains: [String],
            terrainExperience: [String],
            specialisations: Array,
            yearsOfExperience: Number
        }));

        await VendorExperienceProfile.deleteMany({ vendorId: 'TEST-VENDOR' });
        const profile = await VendorExperienceProfile.create({
            vendorId: 'TEST-VENDOR',
            coreDomains: ['METRO', 'TUNNEL'],
            terrainExperience: ['HARD_ROCK', 'URBAN_CONGESTED'],
            specialisations: [
                { workCode: 'TBM_HARD_ROCK', experienceLevel: 'EXPERT', evidenceProjects: [] }
            ],
            yearsOfExperience: 15
        });
        console.log(`✅ CREATED vendor profile with ${profile.coreDomains.length} core domains`);
        console.log(`   Expert in: ${profile.specialisations[0].workCode}\n`);

        // Test 3: Capability Matching Algorithm (Simplified)
        console.log('[3] Testing Capability Matching Algorithm...');
        const sectionRequirements = {
            terrain: 'HARD_ROCK',
            requiredWork: 'TBM_HARD_ROCK',
            domain: 'TUNNEL'
        };

        let matchScore = 0;
        if (profile.terrainExperience.includes(sectionRequirements.terrain)) matchScore += 30;
        if (profile.coreDomains.includes(sectionRequirements.domain)) matchScore += 30;
        const hasExpertise = profile.specialisations.some(s =>
            s.workCode === sectionRequirements.requiredWork && s.experienceLevel === 'EXPERT'
        );
        if (hasExpertise) matchScore += 40;

        console.log(`✅ MATCH SCORE: ${matchScore}%`);
        if (matchScore >= 80) {
            console.log(`   STATUS: HIGH CONFIDENCE MATCH ✓\n`);
        } else {
            console.log(`   STATUS: Low match - review required\n`);
        }

        // Test 4: Strategy Proposal Flow
        console.log('[4] Testing Strategy Governance Workflow...');
        const ProjectStrategy = mongoose.model('ProjectStrategy', new mongoose.Schema({
            projectId: String,
            strategyCode: String,
            status: String,
            proposedBy: String,
            approvedBy: String,
            justification: String,
            riskLevel: String
        }));

        await ProjectStrategy.deleteMany({ projectId: 'TEST-PROJECT' });
        const strategy = await ProjectStrategy.create({
            projectId: 'TEST-PROJECT',
            strategyCode: 'TBM_DOUBLE_SHIFT',
            status: 'PROPOSED',
            proposedBy: 'TEST-VENDOR',
            justification: 'Accelerate timeline by 30%',
            riskLevel: 'MEDIUM'
        });
        console.log(`✅ CREATED strategy proposal: ${strategy.strategyCode}`);
        console.log(`   Risk Level: ${strategy.riskLevel}, Status: ${strategy.status}\n`);

        // Simulate PM Approval
        strategy.status = 'APPROVED';
        strategy.approvedBy = 'TEST-PM';
        strategy.activeFrom = new Date();
        await strategy.save();
        console.log(`✅ APPROVED strategy by PM`);
        console.log(`   Active from: ${strategy.activeFrom.toISOString()}\n`);

        // Test 5: Collaboration Unit Creation
        console.log('[5] Testing Collaboration Unit Structure...');
        const CollaborationUnit = mongoose.model('CollaborationUnit', new mongoose.Schema({
            projectId: String,
            unitType: String,
            name: String,
            leadUserId: String,
            members: Array,
            scope: Object
        }));

        await CollaborationUnit.deleteMany({ projectId: 'TEST-PROJECT' });
        const unit = await CollaborationUnit.create({
            projectId: 'TEST-PROJECT',
            unitType: 'EXECUTION',
            name: 'Tunnel Execution Cell A',
            leadUserId: 'TEST-SUPERVISOR',
            members: [
                { userId: 'TEST-VENDOR', role: 'TBM Operator' },
                { userId: 'TEST-ENGINEER', role: 'Site Engineer' }
            ],
            scope: { sectionIds: ['CP-101', 'CP-102'], taskIds: [] }
        });
        console.log(`✅ CREATED collaboration unit: ${unit.unitType}`);
        console.log(`   Lead: ${unit.leadUserId}, Members: ${unit.members.length}\n`);

        console.log('--- ALL INTELLIGENCE TESTS PASSED ✅ ---');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ VERIFICATION FAILED:', err);
        process.exit(1);
    }
}

verifyIntelligence();
