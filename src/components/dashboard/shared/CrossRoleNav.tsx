// Cross-Role Navigation Component
"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowRight,
    FolderKanban,
    Users,
    Truck,
    DollarSign,
    Building2,
} from 'lucide-react'

interface QuickAction {
    label: string
    href: string
    icon: any
    color: string
}

interface CrossRoleNavProps {
    role: string
    contextType?: 'project' | 'vendor' | 'pm' | 'general'
    projectId?: string
    vendorId?: string
}

const roleActions: Record<string, Record<string, QuickAction[]>> = {
    PROJECT_MANAGER: {
        project: [
            { label: 'Bidding Control', href: '/bidding', icon: DollarSign, color: 'blue' },
            { label: 'Collaborators', href: '/collaborators', icon: Users, color: 'purple' },
        ],
        general: [
            { label: 'Browse Vendors', href: '/dashboard/pm/vendors', icon: Building2, color: 'orange' },
            { label: 'My Collaborations', href: '/dashboard/pm/collaboration', icon: Users, color: 'purple' },
        ],
    },
    VENDOR: {
        project: [
            { label: 'My Tasks', href: '/tasks', icon: FolderKanban, color: 'blue' },
        ],
        general: [
            { label: 'My Projects', href: '/dashboard/vendor/projects', icon: FolderKanban, color: 'blue' },
            { label: 'Bid Invitations', href: '/dashboard/vendor/bids/invitations', icon: DollarSign, color: 'green' },
            { label: 'My Fleet', href: '/dashboard/vendor/fleet', icon: Truck, color: 'purple' },
        ],
    },
}

export function CrossRoleNav({ role, contextType = 'general', projectId, vendorId }: CrossRoleNavProps) {
    const actions = roleActions[role]?.[contextType] || roleActions[role]?.general || []

    if (actions.length === 0) return null

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
                {actions.map((action) => {
                    let href = action.href
                    if (contextType === 'project' && projectId && !href.startsWith('/dashboard')) {
                        href = `/dashboard/${role === 'PROJECT_MANAGER' ? 'pm' : 'vendor'}/projects/${projectId}${action.href}`
                    }

                    const bgColor = {
                        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100',
                        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100',
                        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100',
                        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100',
                    }[action.color] || 'bg-slate-50 text-slate-600'

                    return (
                        <Link
                            key={action.label}
                            href={href}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${bgColor}`}
                        >
                            <action.icon size={16} />
                            {action.label}
                            <ArrowRight size={14} />
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
