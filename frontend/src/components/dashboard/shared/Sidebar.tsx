// Secure, backend-driven dashboard navigation
"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
    BarChart3,
    Boxes,
    Briefcase,
    Building2,
    CalendarDays,
    CheckSquare,
    ChevronDown,
    ChevronsLeft,
    ChevronRight,
    Clock,
    DollarSign,
    FileText,
    FolderGit2,
    FolderKanban,
    Hammer,
    House,
    IndianRupee,
    LayoutDashboard,
    LogOut,
    MapPin,
    Megaphone,
    MessageSquare,
    Receipt,
    ClipboardCheck,
    HardHat,
    Settings,
    Shield,
    Sparkles,
    Truck,
    Users,
} from 'lucide-react'
import { useAuth, type UiRoute } from '@/context/AuthContext'

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
}

const iconMap: Record<string, LucideIcon> = {
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
    Calendar: CalendarDays,
    Building2,
    FolderGit2,
    Boxes,
    BarChart3,
    Sparkles,
    CheckSquare,
    Receipt,
    ClipboardCheck,
    HardHat,
}

const legacyRoutesByRole: Record<string, Record<string, string>> = {
    ADMIN: {
        '/portal/dashboard': '/dashboard/admin',
        '/portal/projects': '/dashboard/admin/projects',
        '/portal/resources': '/dashboard/admin/machines',
        '/portal/reports': '/dashboard/admin/reports',
        '/portal/users': '/dashboard/admin/users',
    },
    PROJECT_HEAD: {
        '/portal/dashboard': '/dashboard/pm',
        '/portal/projects': '/dashboard/pm/projects',
        '/portal/tenders': '/dashboard/pm/bids',
        '/portal/resources': '/dashboard/pm/materials',
        '/portal/reports': '/dashboard/pm/reports',
        '/portal/users': '/dashboard/pm/team',
    },
    EPC_MANAGER: {
        '/portal/dashboard': '/dashboard/pm',
        '/portal/projects': '/dashboard/pm/projects',
        '/portal/tenders': '/dashboard/pm/bids',
        '/portal/resources': '/dashboard/pm/materials',
        '/portal/reports': '/dashboard/pm/reports',
    },
    SUPERVISOR: {
        '/portal/dashboard': '/dashboard/supervisor',
        '/portal/tasks': '/dashboard/supervisor/tasks',
        '/portal/reports': '/dashboard/supervisor/reports',
    },
    VENDOR: {
        '/portal/dashboard': '/dashboard/vendor',
        '/portal/tasks': '/dashboard/vendor/orders',
        '/portal/invoices': '/dashboard/vendor/billing',
    },
    CONSULTANT: {
        '/portal/dashboard': '/dashboard/consultant',
        '/portal/tasks': '/dashboard/consultant',
        '/portal/reports': '/dashboard/consultant',
    },
    CONTRACTOR: {
        '/portal/dashboard': '/dashboard/contractor',
        '/portal/projects': '/dashboard/contractor',
        '/portal/reports': '/dashboard/contractor',
    },
    SUBCONTRACTOR: {
        '/portal/dashboard': '/dashboard/subcontractor',
        '/portal/tasks': '/dashboard/subcontractor',
        '/portal/reports': '/dashboard/subcontractor',
    },
}

function resolveRoute(route: UiRoute, role: string): UiRoute | null {
    if (!route.allowedRoles.includes(role)) return null
    if (!route.path.startsWith('/portal/')) return route

    const resolvedPath = legacyRoutesByRole[role]?.[route.path]
    return resolvedPath ? { ...route, path: resolvedPath } : null
}

interface NavGroup {
    key: string
    label: string
    icon: LucideIcon
    test: RegExp
}

// Section order and names follow the redesign screens. A backend route lands in the first group whose pattern matches.
const NAV_GROUPS: NavGroup[] = [
    { key: 'projects', label: 'Projects', icon: FolderKanban, test: /project|portfolio|corridor|section|weekly|task|schedule/ },
    { key: 'departments', label: 'Departments', icon: Building2, test: /department|team|governance|attendance|daily|supervisor/ },
    { key: 'partners', label: 'Partners', icon: Users, test: /vendor|partner|contractor|consultant|directory/ },
    { key: 'qualifications', label: 'Qualifications', icon: ClipboardCheck, test: /qualif|verif|onboard|document|compliance|quality/ },
    { key: 'tenders', label: 'Tenders', icon: FileText, test: /bid|tender|quote|procure|contract/ },
    { key: 'resources', label: 'Resources', icon: Truck, test: /machine|rental|fleet|material|inventory|resource|equipment|order|request/ },
    { key: 'finance', label: 'Finance', icon: IndianRupee, test: /cost|billing|earning|invoice|payment|commercial|budget|finance/ },
    { key: 'reports', label: 'Reports', icon: BarChart3, test: /report|analytic|performance|summary|activity|insight/ },
    { key: 'communication', label: 'Communication', icon: MessageSquare, test: /chat|message|announcement|communication/ },
    { key: 'administration', label: 'Administration', icon: Settings, test: /./ },
]

const ROLE_ROOT = /^\/dashboard\/(admin|pm|vendor|supervisor|consultant|contractor|subcontractor)$/

function isDashboardRoute(route: UiRoute) {
    return ROLE_ROOT.test(route.path) || /^(dashboard|overview|home)$/i.test(route.label.trim())
}

function groupOf(route: UiRoute) {
    const value = `${route.label} ${route.path}`.toLowerCase()
    return NAV_GROUPS.find(group => group.test.test(value)) as NavGroup
}

function isActivePath(pathname: string, path: string) {
    return pathname === path || (!ROLE_ROOT.test(path) && pathname.startsWith(`${path}/`))
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const resolvedRoutes = (user?.uiRoutes || [])
        .map(route => resolveRoute(route, user?.role || ''))
        .filter((route): route is UiRoute => route !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    const routes = Array.from(new Map(resolvedRoutes.map(route => [route.path, route])).values())

    const dashboardRoute = routes.find(isDashboardRoute)
    const grouped = NAV_GROUPS
        .map(group => ({ group, items: routes.filter(route => route !== dashboardRoute && groupOf(route) === group) }))
        .filter(entry => entry.items.length > 0)
    const activeGroup = grouped.find(entry => entry.items.some(route => isActivePath(pathname, route.path)))?.group.key

    const [openGroups, setOpenGroups] = useState<string[]>([])
    useEffect(() => {
        if (activeGroup) setOpenGroups(current => (current.includes(activeGroup) ? current : [...current, activeGroup]))
    }, [activeGroup])

    const toggleGroup = (key: string) =>
        setOpenGroups(current => (current.includes(key) ? current.filter(item => item !== key) : [...current, key]))

    const topItemClass = (active: boolean) =>
        `relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-[14px] font-semibold transition-colors ${active ? 'bg-gradient-to-r from-[#1257e0] to-[#0f3fa8] text-white shadow-md shadow-blue-950/30' : 'text-[#dbe5f5] hover:bg-white/[0.07] hover:text-white'} ${isOpen ? '' : 'justify-center'}`

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-[#0b1a33] to-[#0a1630] text-slate-100 shadow-2xl shadow-slate-950/10 transition-[width,transform] duration-200 ${isOpen ? 'w-[248px] translate-x-0' : 'w-[76px] -translate-x-full lg:translate-x-0'}`}
        >
            <div className={`flex h-16 shrink-0 items-center ${isOpen ? 'justify-between pl-6 pr-4' : 'justify-center px-2'}`}>
                <Link href="/dashboard" className="min-w-0 text-[21px] font-extrabold tracking-[-0.02em] text-white">
                    {isOpen ? <>Vendor<span className="text-[#3d8bff]">Connect</span></> : <>V<span className="text-[#3d8bff]">C</span></>}
                </Link>
                {isOpen && (
                    <button
                        onClick={onToggle}
                        aria-label="Collapse navigation"
                        className="hidden h-8 w-8 items-center justify-center rounded-lg text-[#9fb3d1] hover:bg-white/10 hover:text-white lg:flex"
                    >
                        <ChevronsLeft size={20} />
                    </button>
                )}
                {!isOpen && (
                    <button
                        onClick={onToggle}
                        aria-label="Expand navigation"
                        className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md hover:text-blue-600 lg:flex"
                    >
                        <ChevronRight size={15} />
                    </button>
                )}
            </div>
            <div className="mx-3 h-px bg-white/10" />

            <nav className="dashboard-sidebar-nav flex-1 space-y-1 overflow-y-auto px-3 py-3">
                {dashboardRoute && (
                    <Link
                        href={dashboardRoute.path}
                        title={!isOpen ? 'Dashboard' : undefined}
                        className={topItemClass(pathname === dashboardRoute.path)}
                    >
                        <House size={20} strokeWidth={1.8} className="shrink-0" />
                        {isOpen && <span className="truncate">Dashboard</span>}
                    </Link>
                )}

                {grouped.map(({ group, items }) => {
                    const GroupIcon = group.icon
                    const groupActive = group.key === activeGroup
                    const open = openGroups.includes(group.key)

                    if (items.length === 1) {
                        const route = items[0]
                        const Icon = iconMap[route.icon] || GroupIcon
                        return (
                            <Link key={group.key} href={route.path} title={!isOpen ? route.label : undefined} className={topItemClass(groupActive)}>
                                <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                                {isOpen && <span className="truncate">{route.label}</span>}
                            </Link>
                        )
                    }

                    if (!isOpen) {
                        return (
                            <Link key={group.key} href={items[0].path} title={group.label} className={topItemClass(groupActive)}>
                                <GroupIcon size={20} strokeWidth={1.8} className="shrink-0" />
                            </Link>
                        )
                    }

                    return (
                        <div key={group.key}>
                            <button
                                onClick={() => toggleGroup(group.key)}
                                aria-expanded={open}
                                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-semibold transition-colors ${groupActive ? 'text-white' : 'text-[#dbe5f5]'} hover:bg-white/[0.07] hover:text-white`}
                            >
                                <GroupIcon size={20} strokeWidth={1.8} className="shrink-0" />
                                <span className="flex-1 truncate">{group.label}</span>
                                <ChevronDown size={16} className={`shrink-0 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
                            </button>
                            {open && (
                                <div className="mb-1.5 ml-[30px] mt-0.5 space-y-0.5">
                                    {items.map(route => {
                                        const active = isActivePath(pathname, route.path)
                                        return (
                                            <Link
                                                key={route.path}
                                                href={route.path}
                                                aria-current={active ? 'page' : undefined}
                                                className={`block truncate rounded-md px-3 py-[7px] text-[13px] transition-colors ${active ? 'bg-[#1257e0]/55 font-semibold text-white' : 'text-[#b9c8e0] hover:bg-white/[0.06] hover:text-white'}`}
                                            >
                                                {route.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
                {routes.length === 0 && isOpen && (
                    <p className="px-3 py-6 text-xs leading-5 text-slate-400">
                        Navigation will appear when your workspace permissions finish loading.
                    </p>
                )}
            </nav>

            <div className="border-t border-white/10 p-3">
                <button
                    onClick={logout}
                    title={!isOpen ? 'Sign out' : undefined}
                    className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-[#9fb3d1] hover:bg-red-500/10 hover:text-red-300 ${isOpen ? '' : 'justify-center'}`}
                >
                    <LogOut size={18} />
                    {isOpen && <span>Sign out</span>}
                </button>
            </div>
        </aside>
    )
}
