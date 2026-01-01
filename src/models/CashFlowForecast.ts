import mongoose, { Schema, Document } from 'mongoose'

export interface IMonthlyForecast {
    month: string             // 'YYYY-MM'
    projectedInflow: number   // Expected receipts from client
    projectedOutflow: number  // Vendor payments + salaries + equipment
    netPosition: number       // Inflow - Outflow
    cumulativePosition: number
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface ICashFlowForecast extends Document {
    projectId: string

    // Forecast period
    forecastStartDate: Date
    forecastEndDate: Date

    // Monthly projections
    monthlyForecasts: IMonthlyForecast[]

    // Current position
    currentCashBalance: number

    // Alerts
    criticalMonths: string[]  // Months where net position is negative

    // Metadata
    lastUpdated: Date
    generatedBy: string
}

const CashFlowForecastSchema = new Schema<ICashFlowForecast>(
    {
        projectId: { type: String, required: true, index: true },

        forecastStartDate: { type: Date, required: true },
        forecastEndDate: { type: Date, required: true },

        monthlyForecasts: [{
            month: { type: String, required: true },
            projectedInflow: { type: Number, required: true },
            projectedOutflow: { type: Number, required: true },
            netPosition: { type: Number, required: true },
            cumulativePosition: { type: Number, required: true },
            confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' }
        }],

        currentCashBalance: { type: Number, default: 0 },
        criticalMonths: [{ type: String }],

        lastUpdated: { type: Date, default: Date.now },
        generatedBy: { type: String, required: true }
    },
    { timestamps: true }
)

export const CashFlowForecast = mongoose.models.CashFlowForecast ||
    mongoose.model<ICashFlowForecast>('CashFlowForecast', CashFlowForecastSchema)
