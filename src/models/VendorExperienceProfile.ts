import mongoose, { Schema, Document } from 'mongoose';

// FORCE MODEL REFRESH IN DEV (CRITICAL FIX)
if (process.env.NODE_ENV !== 'production') {
    delete mongoose.models.VendorExperienceProfile;
}

export interface IExecutedProject {
    projectName: string;
    clientType: 'GOVT' | 'PSU' | 'PRIVATE_EPC' | 'PRIVATE_REAL_ESTATE';
    clientName: string;
    projectCategory: string; // e.g. Roads, Metro
    vendorRole: 'MAIN_CONTRACTOR' | 'SUB_CONTRACTOR' | 'LABOUR_CONTRACTOR' | 'CONSULTANT';
    scopeOfWork: {
        workType: string;
        description: string;
    };
    executionScale: {
        quantityType?: string; // km, cum, sqft
        quantityExecuted?: number;
    };
    commercialContext: {
        wasTendered: boolean;
        valueRange: 'UNDER_1CR' | '1CR_TO_5CR' | '5CR_TO_10CR' | '10CR_TO_25CR' | '25CR_TO_100CR' | 'OVER_100CR';
    };
    duration: {
        startYear: number;
        endYear: number;
    };
}

export interface IServiceOffering {
    serviceDomain: string; // e.g. Roads
    workTypes: string[]; // [Earthwork, PQC]
    executionMethod: {
        mode: 'MANUAL' | 'MECHANIZED' | 'SEMI_MECH';
        constraints: string[];
    };
}

export interface IExecutionTeamCapacity {
    domain: string;
    leadershipLevel: {
        hasDedicatedLead: boolean;
        leadExperienceRange: 'UNDER_5YRS' | '5_TO_10YRS' | '10_TO_15YRS' | 'OVER_15YRS';
    };
    workforceStrength: {
        engineers: '0' | '1-2' | '3-5' | '6-10' | '10+';
        supervisors: '0' | '1-2' | '3-5' | '6-10' | '10+';
        skilledLabour: '0' | '1-10' | '11-30' | '31-50' | '50+';
    };
    qualityReadiness: {
        safetyTraining: boolean;
        qaProcessDefined: boolean;
    };
}

export interface IEquipmentDeployment {
    workType: string;
    machines: {
        machineType: string;
        deployableRange: '0' | '1' | '2-3' | '4-6' | '7+';
        source: 'OWNED' | 'RENTED' | 'MIXED';
    }[];
}

// Human Representative Profile
export interface IHumanReferenceProfile {
    roleType: 'OWNER' | 'DIRECTOR' | 'PROJECT_HEAD' | 'OPS_MANAGER';
    basicIdentity: {
        fullName: string;
        ageRange: '20-25' | '25-30' | '30-40' | '40-55' | '55+';
        currentCity: string;
        personalEmail: string;
        professionalEmail: string;
        phone: string;
    };
    professionalBackground: {
        highestEducation: 'DIPLOMA' | 'BTECH' | 'MTECH' | 'MBA' | 'OTHER';
        educationDomain: string;
        institutionName: string;
        graduationYearRange: 'BEFORE_2000' | '2000-2005' | '2005-2010' | '2010-2015' | '2015-2020' | 'AFTER_2020';
    };
    experienceSnapshot: {
        totalExperienceRange: '0-2' | '2-5' | '5-8' | '8-15' | '15+';
        primarySkills: string[];
        domainExposure: string[];
    };
    linkedinUrl?: string;
}

export interface IVendorExperienceProfile extends Document {
    vendorId: string;
    // Representative Profile (Human)
    representativeProfile: IHumanReferenceProfile;

    // A. Identity
    companyIdentity: {
        legalEntityType: 'PROPRIETORSHIP' | 'LLP' | 'PVT_LTD' | 'PUBLIC_LTD';
        yearEstablished: number;
        registeredLocation: {
            city: string;
            state: string;
        };
        bio: string;
    };
    // B. Execution History
    executedProjects: IExecutedProject[];
    // C. Services Offered
    serviceOfferings: IServiceOffering[];
    // D. Execution Team Capacity
    executionCapacity: IExecutionTeamCapacity[];
    // E. Equipment Deployment
    equipmentDeployment: IEquipmentDeployment[];
    // F. System Generated Trust
    systemTrustScore?: {
        projectsInSystem: number;
        sectionsCompleted: number;
        avgDelayDays: number;
        avgRating: number;
    };
    lastUpdated: Date;
}

const VendorExperienceProfileSchema: Schema = new Schema({
    vendorId: { type: String, required: true, unique: true },

    // Representative Profile (Human)
    representativeProfile: {
        roleType: {
            type: String,
            enum: ['OWNER', 'DIRECTOR', 'PROJECT_HEAD', 'OPS_MANAGER'],
            default: 'OPS_MANAGER'
        },
        basicIdentity: {
            fullName: { type: String },
            ageRange: {
                type: String,
                enum: ['20-25', '25-30', '30-40', '40-55', '55+']
            },
            currentCity: { type: String },
            personalEmail: { type: String },
            professionalEmail: { type: String },
            phone: { type: String }
        },
        professionalBackground: {
            highestEducation: {
                type: String,
                enum: ['DIPLOMA', 'BTECH', 'MTECH', 'MBA', 'OTHER']
            },
            educationDomain: { type: String },
            institutionName: { type: String },
            graduationYearRange: { type: String }
        },
        experienceSnapshot: {
            totalExperienceRange: { type: String },
            primarySkills: [{ type: String }],
            domainExposure: [{ type: String }]
        },
        linkedinUrl: { type: String }
    },

    // A. Identity
    companyIdentity: {
        legalEntityType: { type: String, enum: ['PROPRIETORSHIP', 'LLP', 'PVT_LTD', 'PUBLIC_LTD'] },
        yearEstablished: { type: Number },
        registeredLocation: {
            city: String,
            state: String
        },
        bio: String
    },

    // B. Execution History
    executedProjects: [{
        projectName: String,
        clientType: { type: String, enum: ['GOVT', 'PSU', 'PRIVATE_EPC', 'PRIVATE_REAL_ESTATE'] },
        clientName: String,
        projectCategory: String,
        vendorRole: { type: String, enum: ['MAIN_CONTRACTOR', 'SUB_CONTRACTOR', 'LABOUR_CONTRACTOR', 'CONSULTANT'] },
        scopeOfWork: {
            workType: String,
            description: String
        },
        executionScale: {
            quantityType: String,
            quantityExecuted: Number
        },
        commercialContext: {
            wasTendered: Boolean,
            valueRange: { type: String, enum: ['UNDER_1CR', '1CR_TO_5CR', '5CR_TO_10CR', '10CR_TO_25CR', '25CR_TO_100CR', 'OVER_100CR'] }
        },
        duration: {
            startYear: Number,
            endYear: Number
        }
    }],

    // C. Services
    serviceOfferings: [{
        serviceDomain: String,
        workTypes: [String],
        executionMethod: {
            mode: { type: String, enum: ['MANUAL', 'MECHANIZED', 'SEMI_MECH'] },
            constraints: [String]
        }
    }],

    // D. Team Capacity
    executionCapacity: [{
        domain: String,
        leadershipLevel: {
            hasDedicatedLead: Boolean,
            leadExperienceRange: String
        },
        workforceStrength: {
            engineers: String,
            supervisors: String,
            skilledLabour: String
        },
        qualityReadiness: {
            safetyTraining: Boolean,
            qaProcessDefined: Boolean
        }
    }],

    // E. Equipment
    equipmentDeployment: [{
        workType: String,
        machines: [{
            machineType: String,
            deployableRange: String,
            source: { type: String, enum: ['OWNED', 'RENTED', 'MIXED'] }
        }]
    }],

    // F. System Trust (Read Only)
    systemTrustScore: {
        projectsInSystem: Number,
        sectionsCompleted: Number,
        avgDelayDays: Number,
        avgRating: Number
    },

    lastUpdated: { type: Date, default: Date.now }
});

export const VendorExperienceProfile = mongoose.models.VendorExperienceProfile ||
    mongoose.model<IVendorExperienceProfile>('VendorExperienceProfile', VendorExperienceProfileSchema);
