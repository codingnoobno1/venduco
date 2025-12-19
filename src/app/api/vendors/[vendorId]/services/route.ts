// Vendor Services API - Get vendor's service details
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User } from '@/models/User'
import { Machine } from '@/models/Machine'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET vendor services
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { vendorId } = await params

        const vendor = await User.findById(vendorId)
            .select('name businessName serviceCategories')
            .lean()

        if (!vendor) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Vendor not found' },
                { status: 404 }
            )
        }

        // Get vendor's machines grouped by type
        const machines = await Machine.find({ ownerId: vendorId, isDeleted: { $ne: true } })
            .select('machineType status dailyRate')
            .lean()

        // Group machines by type
        const machinesByType = machines.reduce((acc: Record<string, any>, machine) => {
            const type = machine.machineType || 'Other'
            if (!acc[type]) {
                acc[type] = {
                    type,
                    count: 0,
                    available: 0,
                    avgDailyRate: 0,
                    rates: [],
                }
            }
            acc[type].count++
            if (machine.status === 'AVAILABLE') acc[type].available++
            if (machine.dailyRate) acc[type].rates.push(machine.dailyRate)
            return acc
        }, {})

        // Calculate average rates
        const machineCategories = Object.values(machinesByType).map((cat: any) => ({
            ...cat,
            avgDailyRate: cat.rates.length > 0
                ? Math.round(cat.rates.reduce((a: number, b: number) => a + b, 0) / cat.rates.length)
                : 0,
            rates: undefined,
        }))

        return NextResponse.json({
            success: true,
            data: {
                vendorId,
                vendorName: vendor.name,
                businessName: vendor.businessName,
                serviceCategories: vendor.serviceCategories || [],
                machineCategories,
                totalMachines: machines.length,
                availableMachines: machines.filter(m => m.status === 'AVAILABLE').length,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
