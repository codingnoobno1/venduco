// Admin API: User actions (approve/reject/update)
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User, RegistrationStatus, UserRole } from '@/models'

// GET single user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params

        const user = await User.findById(id).select('-passwordHash').lean()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: user })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// PUT - Update user (approve/reject/change role)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params
        const body = await request.json()
        const { action, role, rejectionReason } = body

        const user = await User.findById(id)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        let updateData: any = {}

        switch (action) {
            case 'APPROVE':
                updateData = {
                    registrationStatus: RegistrationStatus.ACTIVE,
                    requestedRole: role || user.requestedRole,
                    verifiedAt: new Date(),
                    verifiedBy: 'ADMIN', // TODO: Use actual admin ID
                }
                break

            case 'REJECT':
                updateData = {
                    registrationStatus: RegistrationStatus.REJECTED,
                    rejectionReason: rejectionReason || 'Application rejected',
                }
                break

            case 'CHANGE_ROLE':
                if (!role || !Object.values(UserRole).includes(role)) {
                    return NextResponse.json(
                        { success: false, error: 'VALIDATION_ERROR', message: 'Invalid role' },
                        { status: 400 }
                    )
                }
                updateData = { requestedRole: role }
                break

            case 'RESET_TO_PENDING':
                updateData = {
                    registrationStatus: RegistrationStatus.UNDER_VERIFICATION,
                    rejectionReason: null,
                }
                break

            case 'DEACTIVATE':
                updateData = { isActive: false }
                break

            case 'ACTIVATE':
                updateData = { isActive: true }
                break

            default:
                // General update - allow updating specific fields
                const allowedFields = [
                    'name', 'phone', 'city', 'state', 'businessName',
                    'businessType', 'serviceCategories', 'requestedRole'
                ]
                Object.keys(body).forEach(key => {
                    if (allowedFields.includes(key)) {
                        updateData[key] = body[key]
                    }
                })
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
            .select('-passwordHash')
            .lean()

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: `User ${action?.toLowerCase() || 'updated'} successfully`,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params

        const user = await User.findByIdAndDelete(id)

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'NOT_FOUND', message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
