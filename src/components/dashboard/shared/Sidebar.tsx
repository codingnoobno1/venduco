// Sidebar Component - Role-based navigation
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Truck,
    MapPin,
    FileText,
    MessageSquare,
    Megaphone,
    Settings,
    Shield,
    Briefcase,
    Hammer,
    DollarSign,
    Clock,
    Building2,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react'

interface SidebarProps {
    user: any
    isOpen: boolean
    onToggle: () => void
}

const roleMenus: Record<string, any[]> = {
    ADMIN: [
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'All Projects', href: '/dashboard/admin/projects', icon: FolderKanban },
        { name: 'Machines', href: '/dashboard/admin/machines', icon: Truck },
        { name: 'Location Map', href: '/dashboard/admin/map', icon: MapPin },
        { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
        { name: 'Bids', href: '/dashboard/admin/bids', icon: DollarSign },
        { name: 'Rentals', href: '/dashboard/admin/rentals', icon: Briefcase },
        { name: 'Announcements', href: '/dashboard/admin/announcements', icon: Megaphone },
        { name: 'Audit Logs', href: '/dashboard/admin/audit', icon: Shield },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    ],
    PROJECT_MANAGER: [
        { name: 'Dashboard', href: '/dashboard/pm', icon: LayoutDashboard },
        { name: 'My Projects', href: '/dashboard/pm/projects', icon: FolderKanban },
        { name: 'Collaboration', href: '/dashboard/pm/collaboration', icon: Users },
        { name: 'Vendors', href: '/dashboard/pm/vendors', icon: Building2 },
        { name: 'Team', href: '/dashboard/pm/team', icon: Users },
        { name: 'Reports', href: '/dashboard/pm/reports', icon: FileText },
        { name: 'Bids Review', href: '/dashboard/pm/bids', icon: DollarSign },
        { name: 'Rent Machine', href: '/dashboard/pm/rentals', icon: Truck },
        { name: 'Machines', href: '/dashboard/pm/machines', icon: Hammer },
        { name: 'Chat', href: '/dashboard/pm/chat', icon: MessageSquare },
        { name: 'Announcements', href: '/dashboard/pm/announcements', icon: Megaphone },
    ],
    SUPERVISOR: [
        { name: 'Dashboard', href: '/dashboard/supervisor', icon: LayoutDashboard },
        { name: 'My Projects', href: '/dashboard/supervisor/projects', icon: FolderKanban },
        { name: 'Daily Report', href: '/dashboard/supervisor/report', icon: FileText },
        { name: 'Work Hours', href: '/dashboard/supervisor/hours', icon: Clock },
        { name: 'Machines', href: '/dashboard/supervisor/machines', icon: Truck },
        { name: 'Bidding', href: '/dashboard/supervisor/bids', icon: DollarSign },
        { name: 'Chat', href: '/dashboard/supervisor/chat', icon: MessageSquare },
    ],
    VENDOR: [
        { name: 'Dashboard', href: '/dashboard/vendor', icon: LayoutDashboard },
        { name: 'My Projects', href: '/dashboard/vendor/projects', icon: FolderKanban },
        { name: 'My Fleet', href: '/dashboard/vendor/fleet', icon: Truck },
        { name: 'Bid Invitations', href: '/dashboard/vendor/bids/invitations', icon: Briefcase },
        { name: 'Rental Listings', href: '/dashboard/vendor/rentals', icon: Briefcase },
        { name: 'Rental Requests', href: '/dashboard/vendor/requests', icon: DollarSign },
        { name: 'Bidding', href: '/dashboard/vendor/bids', icon: DollarSign },
        { name: 'Maintenance', href: '/dashboard/vendor/maintenance', icon: Hammer },
        { name: 'Assignments', href: '/dashboard/vendor/assignments', icon: FolderKanban },
        { name: 'Earnings', href: '/dashboard/vendor/earnings', icon: DollarSign },
    ],
    COMPANY_REP: [
        { name: 'Dashboard', href: '/dashboard/company', icon: LayoutDashboard },
        { name: 'Employees', href: '/dashboard/company/employees', icon: Users },
        { name: 'Projects', href: '/dashboard/company/projects', icon: FolderKanban },
        { name: 'Fleet', href: '/dashboard/company/fleet', icon: Truck },
        { name: 'Documents', href: '/dashboard/company/documents', icon: FileText },
    ],
}

export function Sidebar({ user, isOpen, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const role = user?.requestedRole || 'VENDOR'
    const menuItems = roleMenus[role] || roleMenus.VENDOR

    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-16'
                }`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
                {isOpen && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                    >
                        VendorConnect
                    </motion.span>
                )}
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* User Info */}
            {isOpen && user && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {user.requestedRole?.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="p-2 flex-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <item.icon size={20} />
                            {isOpen && <span className="font-medium">{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={20} />
                    {isOpen && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    )
}
