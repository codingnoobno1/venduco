const mongoose = require('mongoose');

const specialisedWorks = [
    // Tunneling
    { code: 'TBM_SOFT_GROUND', name: 'TBM Operation (Soft Ground)', category: 'TUNNEL', requiresCertification: true },
    { code: 'TBM_HARD_ROCK', name: 'TBM Operation (Hard Rock)', category: 'TUNNEL', requiresCertification: true },
    { code: 'NATM_EXCAVATION', name: 'NATM / Sequential Excavation', category: 'TUNNEL', requiresCertification: true },
    { code: 'TUNNEL_WATERPROOFING', name: 'Tunnel Membrane Waterproofing', category: 'TUNNEL', requiresCertification: false },

    // Metro & Rail
    { code: 'SLAB_TRACK', name: 'Low Vibration Slab Track', category: 'METRO', requiresCertification: true },
    { code: 'CBTC_SIGNALING', name: 'CBTC Signaling Installation', category: 'METRO', requiresCertification: true },
    { code: 'OHE_25KV', name: '25kV OHE Electrification', category: 'RAIL', requiresCertification: true },
    { code: 'BALLAST_TRACK', name: 'Heavy Haul Ballast Track', category: 'RAIL', requiresCertification: false },

    // Bridges
    { code: 'SEGMENT_LAUNCHING', name: 'Precast Segment Launching (LG)', category: 'BRIDGE', requiresCertification: true },
    { code: 'CABLE_STAYED', name: 'Cable-Stayed Span Construction', category: 'BRIDGE', requiresCertification: true },
    { code: 'DEEP_WELL_FOUNDATION', name: 'Deep Well / Caisson Foundation', category: 'BRIDGE', requiresCertification: false },

    // Roads
    { code: 'PQC_PAVING', name: 'Pavement Quality Concrete (PQC)', category: 'ROAD', requiresCertification: false },
    { code: 'BITUMEN_MODIFIED', name: 'Modified Bitumen Paving', category: 'ROAD', requiresCertification: false },
]

async function seed() {
    console.log('--- SEEDING SPECIALISED WORK CATALOG ---');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/venduco';

    try {
        await mongoose.connect(uri);

        const SpecialisedWorkSchema = new mongoose.Schema({
            code: { type: String, required: true, unique: true },
            name: { type: String, required: true },
            category: { type: String, required: true },
            requiresCertification: { type: Boolean, default: false },
        }, { timestamps: true });

        const SpecialisedWork = mongoose.models.SpecialisedWork ||
            mongoose.model('SpecialisedWork', SpecialisedWorkSchema);

        await SpecialisedWork.deleteMany({});
        await SpecialisedWork.insertMany(specialisedWorks);

        console.log(`✅ SEEDED ${specialisedWorks.length} CATEGORIES SUCCESSFULLY`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ SEEDING FAILED:', err);
        process.exit(1);
    }
}

seed();
