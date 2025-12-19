export const dynamic = 'force-dynamic';
// Registration Status API
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { User } from '@/models'

export async function GET(request: NextRequest) {
    try {
        // Verify token
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        const user = await User.findById(payload.userId).select('-passwordHash')
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        // Calculate profile completeness
        let completeness = 20 // Base for having account
        if (user.city && user.state) completeness += 20
        if (user.requestedRole) completeness += 20
        if (user.registrationStep >= 3) completeness += 30
        if (user.registrationStatus === 'UNDER_VERIFICATION') completeness = 90
        if (user.registrationStatus === 'ACTIVE') completeness = 100

        return NextResponse.json({
            success: true,
            data: {
                userId: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                registrationStep: user.registrationStep,
                status: user.registrationStatus,
                requestedRole: user.requestedRole,
                profileCompleteness: completeness,
                // Include all profile data
                city: user.city,
                state: user.state,
                preferredLanguage: user.preferredLanguage,
                operatingRegions: user.operatingRegions,
                // Role-specific data
                businessType: user.businessType,
                businessName: user.businessName,
                yearsOfOperation: user.yearsOfOperation,
                serviceCategories: user.serviceCategories,
                employmentType: user.employmentType,
                currentOrganization: user.currentOrganization,
                yearsOfExperience: user.yearsOfExperience,
                siteExperience: user.siteExperience,
                skillCategories: user.skillCategories,
                // Timestamps
                submittedAt: user.submittedAt,
                verifiedAt: user.verifiedAt,
                createdAt: user.createdAt,
            },
        })
    } catch (error: any) {
        console.error('Status error:', error)
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
