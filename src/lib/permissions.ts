// Role-Based Access Helper
import { NextResponse } from 'next/server'

export type UserRole = 'ADMIN' | 'PM' | 'VENDOR' | 'SUPERVISOR' | 'COMPANY'

export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
    // Costs & Finance
    'view_costs': ['ADMIN', 'PM'],
    'view_all_quotes': ['ADMIN', 'PM'],
    'view_own_quotes': ['VENDOR'],

    // Projects
    'create_project': ['ADMIN', 'PM'],
    'view_all_projects': ['ADMIN'],
    'assign_team': ['ADMIN', 'PM'],

    // Issues
    'create_issue': ['PM', 'SUPERVISOR', 'ADMIN'],
    'resolve_issue': ['PM', 'ADMIN'],

    // Daily Plan
    'lock_day': ['SUPERVISOR'],
    'view_locked_days': ['PM', 'ADMIN', 'SUPERVISOR'],

    // Attendance
    'submit_attendance': ['SUPERVISOR'],
    'view_attendance': ['PM', 'ADMIN', 'SUPERVISOR'],

    // Billing
    'view_vendor_billing': ['VENDOR', 'ADMIN'],
}

export function checkPermission(userRole: string, permission: string): boolean {
    const allowedRoles = ROLE_PERMISSIONS[permission] || []
    return allowedRoles.includes(userRole as UserRole)
}

export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole as UserRole)
}

export function forbiddenResponse(message: string = 'Access denied') {
    return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message },
        { status: 403 }
    )
}

// Usage in API:
// if (!hasRole(payload.role, ['PM', 'ADMIN'])) {
//     return forbiddenResponse('Only PM can access this resource')
// }
