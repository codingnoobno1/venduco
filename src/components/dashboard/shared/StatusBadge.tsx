// StatusBadge Component - Status indicator pill
"use client"

interface StatusBadgeProps {
    status: string
    size?: 'sm' | 'md'
}

const statusStyles: Record<string, string> = {
    // Project statuses
    PLANNING: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

    // Machine statuses
    AVAILABLE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ASSIGNED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    OUT_OF_SERVICE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

    // Bid statuses
    DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    WITHDRAWN: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',

    // Report statuses
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    REVIEWED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',

    // Rental statuses
    REQUESTED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    IN_USE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',

    // User statuses
    VERIFIED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    UNVERIFIED: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',

    // Default
    DEFAULT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const style = statusStyles[status] || statusStyles.DEFAULT
    const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${style} ${sizeClass}`}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}
