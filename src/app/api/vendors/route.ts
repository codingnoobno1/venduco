export const dynamic = 'force-static';
// Vendors API - List vendors with filters
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User, RegistrationStatus } from '@/models/User'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

// Service categories for filtering
export const SERVICE_CATEGORIES = [
    { value: 'MACHINERY', label: 'Machinery & Equipment' },
    { value: 'LABOUR', label: 'Labour & Manpower' },
    { value: 'MATERIALS', label: 'Construction Materials' },
    { value: 'TRANSPORT', label: 'Transport & Logistics' },
    { value: 'ELECTRICAL', label: 'Electrical Works' },
    { value: 'CIVIL', label: 'Civil Works' },
    { value: 'OTHER', label: 'Other' },
]

// GET list vendors
export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const region = searchParams.get('region')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Build query for active vendors
        const query: any = {
            requestedRole: 'VENDOR',
            registrationStatus: RegistrationStatus.ACTIVE,
            isActive: true,
        }

        // Filter by service category
        if (category) {
            query.serviceCategories = category
        }

        // Filter by region
        if (region) {
            query.$or = [
                { operatingRegions: region },
                { state: region },
                { city: region },
            ]
        }

        // Search by name or business name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } },
            ]
        }

        const skip = (page - 1) * limit

        const [vendors, total] = await Promise.all([
            User.find(query)
                .select('name email phone businessName businessType yearsOfOperation serviceCategories operatingRegions city state avatar')
                .skip(skip)
                .limit(limit)
                .sort({ name: 1 })
                .lean(),
            User.countDocuments(query)
        ])

        // Mask contact info for non-PM users
        const isPM = payload.role === 'PROJECT_MANAGER' || payload.role === 'ADMIN'
        const maskedVendors = vendors.map(vendor => ({
            ...vendor,
            email: isPM ? vendor.email : '***@***.com',
            phone: isPM ? vendor.phone : '**********',
        }))

        return NextResponse.json({
            success: true,
            data: maskedVendors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
