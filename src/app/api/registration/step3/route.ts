export const dynamic = 'force-static';
// Step 3 API: Role-Specific Details
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { User, RegistrationStatus, UserRole } from '@/models'

export async function PUT(request: NextRequest) {
    try {
        // Verify token
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()

        // Get current user to check their role
        const user = await User.findById(payload.userId)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        const body = await request.json()
        let updateData: any = {
            registrationStep: 3,
            registrationStatus: RegistrationStatus.DETAILS_COMPLETED,
        }

        // Handle role-specific fields
        switch (user.requestedRole) {
            case UserRole.VENDOR:
            case UserRole.COMPANY_REP:
                const { businessType, businessName, yearsOfOperation, serviceCategories,
                    gstNumber, panNumber, bankAccountNumber, ifscCode, bankAccountName } = body

                // Validation
                if (!businessType || !businessName || !serviceCategories?.length) {
                    return NextResponse.json(
                        { success: false, error: 'VALIDATION_ERROR', message: 'Business type, name and categories are required' },
                        { status: 400 }
                    )
                }

                // PAN validation
                if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
                    return NextResponse.json(
                        { success: false, error: 'VALIDATION_ERROR', message: 'Invalid PAN format', field: 'panNumber' },
                        { status: 400 }
                    )
                }

                updateData = {
                    ...updateData,
                    businessType,
                    businessName,
                    yearsOfOperation: yearsOfOperation || 0,
                    serviceCategories,
                    gstNumber,
                    panNumber,
                    bankAccountNumber,
                    ifscCode,
                    bankAccountName,
                }
                break

            case UserRole.PROJECT_MANAGER:
                const { employmentType, currentOrganization, yearsOfExperience,
                    pastProjects, certifications, declarationAccepted } = body

                if (!employmentType || !currentOrganization || !declarationAccepted) {
                    return NextResponse.json(
                        { success: false, error: 'VALIDATION_ERROR', message: 'Employment type, organization and declaration are required' },
                        { status: 400 }
                    )
                }

                updateData = {
                    ...updateData,
                    employmentType,
                    currentOrganization,
                    yearsOfExperience: yearsOfExperience || 0,
                    pastProjects,
                    certifications,
                    declarationAccepted,
                }
                break

            case UserRole.SUPERVISOR:
                const { siteExperience, skillCategories, workingUnderType, workingUnderName } = body

                if (!skillCategories?.length || !workingUnderType) {
                    return NextResponse.json(
                        { success: false, error: 'VALIDATION_ERROR', message: 'Skill categories and working under type are required' },
                        { status: 400 }
                    )
                }

                updateData = {
                    ...updateData,
                    siteExperience: siteExperience || 0,
                    skillCategories,
                    workingUnderType,
                    workingUnderName,
                }
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'INVALID_ROLE', message: 'Complete Step 2 first to select a role' },
                    { status: 400 }
                )
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            payload.userId,
            updateData,
            { new: true }
        )

        return NextResponse.json({
            success: true,
            data: {
                registrationStep: 3,
                status: updatedUser?.registrationStatus,
            },
            message: 'Details saved successfully',
        })
    } catch (error: any) {
        console.error('Step 3 error:', error)
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
