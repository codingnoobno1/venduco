const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const ProjectSchema = new mongoose.Schema({}, { strict: false });
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

async function checkProjects() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const projects = await Project.find({}).lean();
        console.log(`Found ${projects.length} projects total.`);

        projects.forEach(p => {
            console.log(`- Project: ${p.name} (${p.projectCode})`);
            console.log(`  Status: ${p.status}`);
            console.log(`  Bidding Mode: ${p.biddingMode}`);
            console.log(`  Bidding Enabled: ${p.biddingEnabled}`);
            console.log(`  Created By: ${p.createdBy}`);
            console.log('---');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkProjects();
