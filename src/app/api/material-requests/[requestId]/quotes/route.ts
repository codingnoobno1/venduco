// Vendor Quote Comparison API - For PM commercial decisions
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

const MaterialRequest = mongoose.models.MaterialRequest

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ requestId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        // Only PM and ADMIN can see all quotes
        if (payload.role !== 'PM' && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Only PM can view quote comparisons' },
                { status: 403 }
            )
        }

        await dbConnect()
        const { requestId } = await context.params

        const materialRequest = await MaterialRequest.findById(requestId).lean()

        if (!materialRequest) {
            return NextResponse.json(
                { success: false, message: 'Material request not found' },
                { status: 404 }
            )
        }

        const quotes = ((materialRequest as any).quotes || []).map((quote: any) => ({
            vendorId: quote.vendorId,
            vendorName: quote.vendorName,
            unitPrice: quote.unitPrice,
            totalPrice: quote.totalPrice,
            deliveryDays: quote.deliveryDays,
            deliveryDate: quote.deliveryDate,
            notes: quote.notes,
            quotedAt: quote.quotedAt,
            // Calculate value metrics
            pricePerDay: quote.deliveryDays > 0 ? quote.totalPrice / quote.deliveryDays : quote.totalPrice,
        }))

        // Sort by total price
        quotes.sort((a: any, b: any) => a.totalPrice - b.totalPrice)

        // Add ranking
        quotes.forEach((q: any, idx: number) => {
            q.priceRank = idx + 1
        })

        // Sort by delivery days  
        const byDelivery = [...quotes].sort((a: any, b: any) => a.deliveryDays - b.deliveryDays)
        byDelivery.forEach((q: any, idx: number) => {
            const original = quotes.find((oq: any) => oq.vendorId === q.vendorId)
            if (original) original.deliveryRank = idx + 1
        })

        // Find best overall (lowest combined rank)
        quotes.forEach((q: any) => {
            q.combinedScore = q.priceRank + q.deliveryRank
        })
        quotes.sort((a: any, b: any) => a.combinedScore - b.combinedScore)

        const bestValue = quotes[0]?.vendorName

        // Statistics
        const avgPrice = quotes.length > 0
            ? quotes.reduce((sum: number, q: any) => sum + q.totalPrice, 0) / quotes.length
            : 0
        const minPrice = quotes.length > 0 ? Math.min(...quotes.map((q: any) => q.totalPrice)) : 0
        const maxPrice = quotes.length > 0 ? Math.max(...quotes.map((q: any) => q.totalPrice)) : 0
        const avgDelivery = quotes.length > 0
            ? quotes.reduce((sum: number, q: any) => sum + q.deliveryDays, 0) / quotes.length
            : 0

        return NextResponse.json({
            success: true,
            data: {
                request: {
                    id: (materialRequest as any)._id,
                    materialName: (materialRequest as any).materialName,
                    quantity: (materialRequest as any).quantity,
                    unit: (materialRequest as any).unit,
                    requiredBy: (materialRequest as any).requiredBy,
                    projectName: (materialRequest as any).projectName,
                    status: (materialRequest as any).status,
                },
                quotes,
                comparison: {
                    totalQuotes: quotes.length,
                    avgPrice,
                    minPrice,
                    maxPrice,
                    priceDiff: maxPrice - minPrice,
                    avgDelivery,
                    bestValue,
                },
                selectedQuote: (materialRequest as any).selectedQuote,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
