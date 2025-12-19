export const dynamic = 'force-dynamic';
// Auto Cost Calculation API - For PM Costs
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Project } from '@/models'
import mongoose from 'mongoose'

const Attendance = mongoose.models.Attendance
const MaterialRequest = mongoose.models.MaterialRequest
const MachineRental = mongoose.models.MachineRental

// Default labour rates (can be configured per project)
const LABOUR_RATES = {
    skilled: 800, // Rs per day
    unskilled: 500, // Rs per day
    overtime_multiplier: 1.5,
}

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        // Role check - only PM and ADMIN can see costs
        if (payload.role !== 'PM' && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Access denied. Only PM can view costs.' },
                { status: 403 }
            )
        }

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: 'Project ID required' },
                { status: 400 }
            )
        }

        // Get project
        const project = await Project.findById(projectId).lean()
        if (!project) {
            return NextResponse.json(
                { success: false, message: 'Project not found' },
                { status: 404 }
            )
        }

        // Calculate Labour Cost from Attendance
        let labourCost = 0
        if (Attendance) {
            const attendanceRecords = await Attendance.find({ projectId }).lean()

            for (const record of attendanceRecords as any[]) {
                const shiftMultiplier = record.shift === 'DOUBLE' ? 2 : 1
                labourCost += (record.skilledCount || 0) * LABOUR_RATES.skilled * shiftMultiplier
                labourCost += (record.unskilledCount || 0) * LABOUR_RATES.unskilled * shiftMultiplier
            }
        }

        // Calculate Material Cost
        let materialCost = 0
        if (MaterialRequest) {
            const materials = await MaterialRequest.find({
                projectId,
                status: { $in: ['APPROVED', 'FULFILLED'] }
            }).lean()

            for (const mat of materials as any[]) {
                materialCost += mat.selectedQuote?.totalPrice || 0
            }
        }

        // Calculate Machine Rental Cost
        let machineCost = 0
        if (MachineRental) {
            const rentals = await MachineRental.find({
                projectId,
                status: { $in: ['ACTIVE', 'COMPLETED'] }
            }).lean()

            for (const rental of rentals as any[]) {
                const days = rental.durationDays ||
                    Math.ceil((new Date(rental.endDate || Date.now()).getTime() -
                        new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))
                machineCost += (rental.dailyRate || 0) * days
            }
        }

        const totalSpent = labourCost + materialCost + machineCost
        const budget = (project as any).budget || 0
        const budgetUsedPercent = budget > 0 ? (totalSpent / budget) * 100 : 0

        // Breakdown by category
        const breakdown = [
            { category: 'Labour', amount: labourCost, percent: totalSpent > 0 ? (labourCost / totalSpent) * 100 : 0 },
            { category: 'Materials', amount: materialCost, percent: totalSpent > 0 ? (materialCost / totalSpent) * 100 : 0 },
            { category: 'Machines', amount: machineCost, percent: totalSpent > 0 ? (machineCost / totalSpent) * 100 : 0 },
        ]

        return NextResponse.json({
            success: true,
            summary: {
                budget,
                spent: totalSpent,
                budgetUsedPercent,
                machineUsage: machineCost,
                materialOrders: materialCost,
                labourEstimate: labourCost,
            },
            breakdown,
            rates: LABOUR_RATES,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
