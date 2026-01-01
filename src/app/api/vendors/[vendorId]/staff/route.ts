import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { OrganizationAffiliation, EmploymentType } from '@/models/OrganizationAffiliation'
import { User } from '@/models/User'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET vendor's staff (supervisors/workers)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { vendorId } = await params

        // Only vendor themselves or admin can view staff
        if (payload.userId !== vendorId && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Access denied' },
                { status: 403 }
            )
        }

        const staff = await OrganizationAffiliation.find({
            vendorId,
            isActive: true
        }).sort({ joinedAt: -1 }).lean()

        return NextResponse.json({
            success: true,
            data: staff
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

// POST add staff member to vendor
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { vendorId } = await params
        const body = await request.json()
        const { userId, designation, employmentType, contractEndDate } = body

        // Only vendor can add their own staff
        if (payload.userId !== vendorId && payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Only vendor can add staff' },
                { status: 403 }
            )
        }

        // Get user details
        const user = await User.findById(userId).select('name').lean()
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            )
        }

        // Get vendor details
        const vendor = await User.findById(vendorId).select('name').lean()

        const affiliation = await OrganizationAffiliation.create({
            userId,
            userName: user.name,
            vendorId,
            vendorName: vendor?.name || 'Unknown Vendor',
            employmentType: employmentType || EmploymentType.CONTRACT,
            designation,
            contractEndDate: contractEndDate ? new Date(contractEndDate) : undefined
        })

        return NextResponse.json({
            success: true,
            data: affiliation,
            message: 'Staff member added successfully'
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
