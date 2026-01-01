// Project Model - Enhanced with departments, work packages, and 3-step workflow
import mongoose, { Schema, Document } from 'mongoose'

export enum ProjectStatus {
    PLANNING = 'PLANNING',
    ACTIVE = 'ACTIVE',
    ON_HOLD = 'ON_HOLD',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum ProjectType {
    RAILWAY = 'RAILWAY',
    METRO = 'METRO',
    CONSTRUCTION = 'CONSTRUCTION',
    INDUSTRIAL = 'INDUSTRIAL',
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    OTHER = 'OTHER',
}

export enum PlanningStatus {
    IDEATION = 'IDEATION',
    APPROVED = 'APPROVED',
    PRE_BID = 'PRE_BID',
    BIDDING_OPEN = 'BIDDING_OPEN',
    AWARDED = 'AWARDED',
}

export enum BiddingMode {
    CLOSED = 'CLOSED',         // No bidding allowed
    OPEN = 'OPEN',             // Open to all vendors
    INVITE_ONLY = 'INVITE_ONLY', // Only invited vendors can bid
}

export enum DepartmentName {
    OHE_ELECTRICAL = 'OHE / Electrical',
    CIVIL = 'Civil',
    SIGNAL = 'Signal',
    TELECOM = 'Telecom',
    BUILDINGS = 'Buildings',
}

export enum WorkPackageNature {
    SUPPLIER = 'SUPPLIER',
    SUB_CONTRACTOR = 'SUB_CONTRACTOR',
}

// Work Package Interface
export interface IWorkPackage {
    id: string
    nature: WorkPackageNature
    scope: string
    budget: number
    // For Supplier
    material?: string
    quantity?: string
    // For Sub-Contractor
    deliverables?: string
    // BoQ
    boqFileUrl?: string
}

// Department Interface
export interface IDepartment {
    name: DepartmentName | string
    isSelected: boolean
    workPackages: IWorkPackage[]
}

export interface IProject extends Document {
    // Step 0: Project Details
    name: string
    projectCode: string
    description?: string
    location: string
    address?: string
    coordinates?: {
        lat: number
        lng: number
    }

    // New Fields for Workflow
    clientName: string
    projectType: ProjectType
    planningStatus: PlanningStatus
    minExperience?: number  // years
    requiredBrands?: string
    maintenancePeriod?: number // years
    imageUrl?: string

    // Budget Tracking
    budget: number
    budgetUsed: number
    budgetAllocations?: Array<{
        category: string
        amount: number
        spent: number
    }>

    // Timeline
    startDate: Date
    deadline: Date
    completedAt?: Date

    // Progress
    progress: number
    milestonesTotal: number
    milestonesCompleted: number

    // Team
    pmId?: string
    pmName?: string
    vendorsCount: number
    supervisorsCount: number

    // Machines
    machinesAssigned: number

    // Reports
    pendingReports: number

    // Step 1: Departments & Work Packages
    departments: IDepartment[]

    // Settings
    status: ProjectStatus
    priority: ProjectPriority
    tags?: string[]

    // Bidding Control
    biddingMode: BiddingMode
    biddingEnabled: boolean
    biddingStartDate?: Date
    biddingEndDate?: Date
    allowedVendorIds?: string[]
    directJoinVendorIds?: string[]

    // Meta
    createdBy: string
    deletedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const WorkPackageSchema = new Schema({
    id: { type: String, required: true },
    nature: {
        type: String,
        enum: Object.values(WorkPackageNature),
        required: true
    },
    scope: { type: String, required: true },
    budget: { type: Number, required: true, min: 0 },
    material: { type: String },
    quantity: { type: String },
    deliverables: { type: String },
    boqFileUrl: { type: String },
}, { _id: false })

const DepartmentSchema = new Schema({
    name: { type: String, required: true },
    isSelected: { type: Boolean, default: false },
    workPackages: [WorkPackageSchema],
}, { _id: false })

const ProjectSchema = new Schema<IProject>(
    {
        // Basic Info
        name: { type: String, required: true, trim: true },
        projectCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
        description: { type: String, trim: true },
        location: { type: String, required: true, trim: true },
        address: { type: String, trim: true },
        coordinates: {
            lat: Number,
            lng: Number,
        },

        // New Workflow Fields
        clientName: { type: String, required: true, trim: true },
        projectType: {
            type: String,
            enum: Object.values(ProjectType),
            default: ProjectType.CONSTRUCTION,
        },
        planningStatus: {
            type: String,
            enum: Object.values(PlanningStatus),
            default: PlanningStatus.IDEATION,
        },
        minExperience: { type: Number, min: 0 },
        requiredBrands: { type: String },
        maintenancePeriod: { type: Number, min: 0 },
        imageUrl: { type: String },

        // Budget
        budget: { type: Number, required: true, min: 0 },
        budgetUsed: { type: Number, default: 0, min: 0 },
        budgetAllocations: [{
            category: String,
            amount: Number,
            spent: Number,
        }],

        // Timeline
        startDate: { type: Date, required: true },
        deadline: { type: Date, required: true },
        completedAt: { type: Date },

        // Progress
        progress: { type: Number, default: 0, min: 0, max: 100 },
        milestonesTotal: { type: Number, default: 0 },
        milestonesCompleted: { type: Number, default: 0 },

        // Team
        pmId: { type: String },
        pmName: { type: String },
        vendorsCount: { type: Number, default: 0 },
        supervisorsCount: { type: Number, default: 0 },

        // Machines
        machinesAssigned: { type: Number, default: 0 },

        // Reports
        pendingReports: { type: Number, default: 0 },

        // Departments & Work Packages
        departments: [DepartmentSchema],

        // Settings
        status: {
            type: String,
            enum: Object.values(ProjectStatus),
            default: ProjectStatus.PLANNING,
        },
        priority: {
            type: String,
            enum: Object.values(ProjectPriority),
            default: ProjectPriority.NORMAL,
        },
        tags: [{ type: String }],

        // Bidding Control
        biddingMode: {
            type: String,
            enum: Object.values(BiddingMode),
            default: BiddingMode.CLOSED,
        },
        biddingEnabled: { type: Boolean, default: false },
        biddingStartDate: { type: Date },
        biddingEndDate: { type: Date },
        allowedVendorIds: [{ type: String }],
        directJoinVendorIds: [{ type: String }],

        // Meta
        createdBy: { type: String, required: true },
        deletedAt: { type: Date },
    },
    { timestamps: true }
)

// Indexes
ProjectSchema.index({ status: 1 })
ProjectSchema.index({ createdBy: 1 })
ProjectSchema.index({ pmId: 1 })
ProjectSchema.index({ startDate: 1, deadline: 1 })
ProjectSchema.index({ projectType: 1 })
ProjectSchema.index({ planningStatus: 1 })

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

