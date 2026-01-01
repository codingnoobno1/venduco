import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { ProjectBudget } from '@/models/ProjectBudget'
import { CostTracking } from '@/models/CostTracking'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET burn rate analysis
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        // Get budget
        const budget = await ProjectBudget.findOne({ projectId }).lean()
        if (!budget) {
            return NextResponse.json({
                success: false,
                message: 'No budget allocated for this project'
            }, { status: 404 })
        }

        // Get all costs
        const costs = await CostTracking.find({ projectId }).lean()

        // Calculate section-wise burn
        const sectionBurnRate = budget.sectionBudgets.map((sectionBudget: any) => {
            const sectionCosts = costs.filter(c => c.sectionId === sectionBudget.sectionId)
            const totalSpent = sectionCosts.reduce((sum, c) => sum + c.amount, 0)
            const utilizationPercentage = (totalSpent / sectionBudget.totalBudget) * 100

            return {
                sectionId: sectionBudget.sectionId,
                sectionName: sectionBudget.sectionName,
                budgeted: sectionBudget.totalBudget,
                spent: totalSpent,
                remaining: sectionBudget.totalBudget - totalSpent,
                utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
                status: utilizationPercentage >= 100 ? 'OVERRUN' :
                    utilizationPercentage >= 90 ? 'CRITICAL' :
                        utilizationPercentage >= 75 ? 'WARNING' : 'HEALTHY'
            }
        })

        // Overall project burn
        const totalSpent = costs.reduce((sum, c) => sum + c.amount, 0)
        const overallUtilization = (totalSpent / budget.totalBudget) * 100

        // Category-wise burn
        const categoryBurn = budget.overallCategoryBreakdown.map((catBudget: any) => {
            const catCosts = costs.filter(c => c.category === catBudget.category)
            const catSpent = catCosts.reduce((sum, c) => sum + c.amount, 0)

            return {
                category: catBudget.category,
                budgeted: catBudget.amount,
                spent: catSpent,
                remaining: catBudget.amount - catSpent,
                utilizationPercentage: Math.round((catSpent / catBudget.amount) * 10000) / 100
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                overall: {
                    totalBudget: budget.totalBudget,
                    totalSpent,
                    remaining: budget.totalBudget - totalSpent,
                    utilizationPercentage: Math.round(overallUtilization * 100) / 100
                },
                sectionBurnRate,
                categoryBurn
            }
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
