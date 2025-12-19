export const dynamic = 'force-static';
// Vendor Billing Summary API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import mongoose from 'mongoose'

const MaterialRequest = mongoose.models.MaterialRequest
const MachineRental = mongoose.models.MachineRental

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'month'

        // Calculate date range
        const now = new Date()
        let startDate = new Date()
        switch (period) {
            case 'week':
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
                startDate.setMonth(now.getMonth() - 1)
                break
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3)
                break
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1)
                break
        }

        let transactions: any[] = []
        let totalEarnings = 0
        let pendingAmount = 0
        let paidAmount = 0
        let ordersCompleted = 0

        // Get material orders (where vendor quote was selected)
        if (MaterialRequest) {
            const materialOrders = await MaterialRequest.find({
                'selectedQuote.vendorId': payload.userId,
                createdAt: { $gte: startDate }
            }).lean()

            materialOrders.forEach((order: any) => {
                const amount = order.selectedQuote?.totalPrice || 0
                totalEarnings += amount

                if (order.status === 'FULFILLED') {
                    paidAmount += amount
                    ordersCompleted++
                } else {
                    pendingAmount += amount
                }

                transactions.push({
                    date: order.createdAt,
                    projectName: order.projectName,
                    description: `Material: ${order.materialName} (${order.quantity} ${order.unit})`,
                    amount,
                    status: order.status === 'FULFILLED' ? 'PAID' : 'PENDING',
                    type: 'MATERIAL'
                })
            })
        }

        // Get machine rentals
        if (MachineRental) {
            const rentals = await MachineRental.find({
                vendorId: payload.userId,
                createdAt: { $gte: startDate }
            }).lean()

            rentals.forEach((rental: any) => {
                const amount = rental.totalCost || (rental.dailyRate * rental.durationDays) || 0
                totalEarnings += amount

                if (rental.status === 'COMPLETED') {
                    paidAmount += amount
                    ordersCompleted++
                } else if (rental.status === 'ACTIVE') {
                    pendingAmount += amount
                }

                transactions.push({
                    date: rental.createdAt,
                    projectName: rental.projectName,
                    description: `Machine Rental: ${rental.machineCode || 'Machine'}`,
                    amount,
                    status: rental.status === 'COMPLETED' ? 'PAID' : 'PENDING',
                    type: 'RENTAL'
                })
            })
        }

        // Sort by date descending
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return NextResponse.json({
            success: true,
            summary: {
                totalEarnings,
                pendingAmount,
                paidAmount,
                ordersCompleted,
            },
            transactions,
            period,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
