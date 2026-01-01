import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { CashFlowForecast } from '@/models/CashFlowForecast'
import { Invoice } from '@/models/Invoice'
import { CostTracking } from '@/models/CostTracking'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET cash flow forecast
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { projectId } = await params

        // Get or generate forecast
        let forecast = await CashFlowForecast.findOne({ projectId })
            .sort({ createdAt: -1 })
            .lean()

        // If no forecast or outdated (>7 days), generate new
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        if (!forecast || new Date(forecast.lastUpdated) < sevenDaysAgo) {
            forecast = await generateCashFlowForecast(projectId, payload.userId)
        }

        return NextResponse.json({
            success: true,
            data: forecast
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

async function generateCashFlowForecast(projectId: string, userId: string) {
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months

    // Get pending and future invoices (inflows)
    const invoices = await Invoice.find({
        projectId,
        status: { $in: ['PENDING', 'APPROVED'] }
    }).lean()

    // Get historical costs to estimate future outflows
    const costs = await CostTracking.find({ projectId }).lean()
    const avgMonthlyCost = costs.length > 0
        ? costs.reduce((sum, c) => sum + c.amount, 0) / 6 // Assume 6 months of data
        : 0

    // Generate 6-month forecast
    const monthlyForecasts = []
    let cumulativePosition = 0

    for (let i = 0; i < 6; i++) {
        const month = new Date(startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000)
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`

        // Simplified: assume invoices distributed evenly
        const projectedInflow = invoices.reduce((sum, inv) => sum + inv.amount, 0) / 6
        const projectedOutflow = avgMonthlyCost

        const netPosition = projectedInflow - projectedOutflow
        cumulativePosition += netPosition

        monthlyForecasts.push({
            month: monthStr,
            projectedInflow: Math.round(projectedInflow),
            projectedOutflow: Math.round(projectedOutflow),
            netPosition: Math.round(netPosition),
            cumulativePosition: Math.round(cumulativePosition),
            confidence: 'MEDIUM' as const
        })
    }

    // Identify critical months
    const criticalMonths = monthlyForecasts
        .filter(m => m.netPosition < 0)
        .map(m => m.month)

    const forecast = await CashFlowForecast.create({
        projectId,
        forecastStartDate: startDate,
        forecastEndDate: endDate,
        monthlyForecasts,
        currentCashBalance: 0, // Should be fetched from accounting system
        criticalMonths,
        generatedBy: userId
    })

    return forecast
}
