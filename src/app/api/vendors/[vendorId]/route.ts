// Vendor Profile API - Get vendor details
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User, RegistrationStatus } from '@/models/User'
import { Machine } from '@/models/Machine'
import { Bid, BidStatus } from '@/models/Bid'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// GET vendor profile
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
            .select('-passwordHash')
            .lean()

        if (!vendor) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'Vendor not found' },
                { status: 404 }
            )
        }

        if (vendor.requestedRole !== 'VENDOR') {
            return NextResponse.json(
                { success: false, error: 'INVALID', message: 'User is not a vendor' },
                { status: 400 }
            )
        }

        // Get vendor's machine fleet count
        const machineCount = await Machine.countDocuments({ ownerId: vendorId })

        // Get vendor's bid stats
        const [totalBids, approvedBids] = await Promise.all([
            Bid.countDocuments({ bidderId: vendorId }),
            Bid.countDocuments({ bidderId: vendorId, status: BidStatus.APPROVED }),
        ])

        const isPM = payload.role === 'PROJECT_MANAGER' || payload.role === 'ADMIN'

        // Build response with optional contact masking
        const profile = {
            _id: vendor._id,
            name: vendor.name,
            businessName: vendor.businessName,
            businessType: vendor.businessType,
            yearsOfOperation: vendor.yearsOfOperation,
            serviceCategories: vendor.serviceCategories,
            operatingRegions: vendor.operatingRegions,
            city: vendor.city,
            state: vendor.state,
            avatar: vendor.avatar,
            // Contact info (PM only)
            email: isPM ? vendor.email : undefined,
            phone: isPM ? vendor.phone : undefined,
            // Stats
            stats: {
                machineCount,
                totalBids,
                approvedBids,
                successRate: totalBids > 0 ? Math.round((approvedBids / totalBids) * 100) : 0,
            },
            // Registration
            registrationStatus: vendor.registrationStatus,
            createdAt: vendor.createdAt,
        }

        return NextResponse.json({
            success: true,
            data: profile,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
