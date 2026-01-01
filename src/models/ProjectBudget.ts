import mongoose, { Schema, Document } from 'mongoose'

export enum BudgetCategory {
    LABOR = 'LABOR',
    MATERIAL = 'MATERIAL',
    EQUIPMENT = 'EQUIPMENT',
    SUBCONTRACTOR = 'SUBCONTRACTOR',
    OVERHEADS = 'OVERHEADS',
    CONTINGENCY = 'CONTINGENCY'
}

export interface ISectionBudget {
    sectionId: string
    sectionName: string
    totalBudget: number
    categoryBreakdown: {
        category: BudgetCategory
        amount: number
        percentage: number
    }[]
}

export interface IProjectBudget extends Document {
    projectId: string
    totalBudget: number

    // Section-wise allocation
    sectionBudgets: ISectionBudget[]

    // Overall category breakdown
    overallCategoryBreakdown: {
        category: BudgetCategory
        amount: number
        percentage: number
    }[]

    // Reserves
    contingencyReserve: number
    contingencyPercentage: number

    // Tracking
    approvedBy: string
    approvedDate: Date
    lastRevisionDate?: Date
    revisionNumber: number
}

const ProjectBudgetSchema = new Schema<IProjectBudget>(
    {
        projectId: { type: String, required: true, unique: true, index: true },
        totalBudget: { type: Number, required: true },

        sectionBudgets: [{
            sectionId: { type: String, required: true },
            sectionName: { type: String, required: true },
            totalBudget: { type: Number, required: true },
            categoryBreakdown: [{
                category: { type: String, enum: Object.values(BudgetCategory), required: true },
                amount: { type: Number, required: true },
                percentage: { type: Number, required: true }
            }]
        }],

        overallCategoryBreakdown: [{
            category: { type: String, enum: Object.values(BudgetCategory), required: true },
            amount: { type: Number, required: true },
            percentage: { type: Number, required: true }
        }],

        contingencyReserve: { type: Number, default: 0 },
        contingencyPercentage: { type: Number, default: 5 },

        approvedBy: { type: String, required: true },
        approvedDate: { type: Date, default: Date.now },
        lastRevisionDate: { type: Date },
        revisionNumber: { type: Number, default: 1 }
    },
    { timestamps: true }
)

export const ProjectBudget = mongoose.models.ProjectBudget ||
    mongoose.model<IProjectBudget>('ProjectBudget', ProjectBudgetSchema)
