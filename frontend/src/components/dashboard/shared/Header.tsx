// Compact context header shared by all authenticated dashboards
"use client"

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
    Bell,
    Building2,
    ChevronDown,
    Layers3,
    LogOut,
    Menu,
    Search,
    UserRound,
} from 'lucide-react'
import { useAuth, type UserProfile } from '@/context/AuthContext'

interface HeaderProps {
    user: UserProfile
    onMenuClick: () => void
}

function humanizeRole(role: string) {
    return role
        .toLowerCase()
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

const ROLE_WORKSPACES: Record<string, string> = {
    admin: 'Platform administration',
    pm: 'Project delivery',
    vendor: 'Vendor portal',
    supervisor: 'Site supervision',
    consultant: 'Consultant review',
    contractor: 'Contractor workspace',
    subcontractor: 'Subcontractor workspace',
    company: 'Company workspace',
    guest: 'Guest workspace',
}

/** "/dashboard/pm/projects/123" -> "PROJECT DELIVERY · PROJECTS": a quiet reminder of where you are. */
function workspaceLabel(pathname: string) {
    const [, , area, section] = pathname.split('/')
    const workspace = ROLE_WORKSPACES[area] || 'Workspace'
    const page = section && !/^[0-9a-f-]{8,}$/i.test(section) ? section.replace(/-/g, ' ') : 'dashboard'
    return `${workspace} · ${page}`
}

function ContextPicker({
    icon: Icon,
    label,
    value,
    className = '',
}: {
    icon: typeof Building2
    label: string
    value: string
    className?: string
}) {
    return (
        <div className={`hidden h-[44px] items-center gap-3 rounded-lg border border-[#e3e8f0] px-3 text-left md:flex ${className}`}>
            <Icon size={19} strokeWidth={1.7} className="shrink-0 text-slate-600" />
            <span className="min-w-0 flex-1">
                <span className="block text-[11px] leading-[14px] text-[#5b6b82]">{label}</span>
                <span className="block truncate text-[13px] font-semibold leading-[17px] text-[#0f1b2d]">{value}</span>
            </span>
            <ChevronDown size={15} className="shrink-0 text-slate-500" />
        </div>
    )
}

export function Header({ user, onMenuClick }: HeaderProps) {
    const pathname = usePathname()
    const { logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const organizationLabel = user.organizationId
        ? `Organization ${user.organizationId.slice(0, 8)}`
        : 'No organization assigned'
    const initials = user.fullName
        ?.split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'U'

    useEffect(() => {
        if (!menuOpen) return
        const close = (event: MouseEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [menuOpen])

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#e3e8f0] bg-white px-4 sm:px-5">
            <button
                onClick={onMenuClick}
                aria-label="Toggle navigation"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
                <Menu size={20} />
            </button>

            <div className="flex min-w-0 items-center gap-3">
                <ContextPicker icon={Building2} label="Organization" value={organizationLabel} className="w-[250px] bg-white" />
                <ContextPicker icon={Layers3} label="Project" value="All permitted projects" className="w-[230px] bg-white" />
                <ContextPicker icon={UserRound} label="Role" value={humanizeRole(user.role)} className="w-[220px] border-transparent bg-[#f4f7fc]" />
            </div>

            <p className="hidden min-w-0 flex-1 truncate border-l border-[#e3e8f0] pl-3 text-[11px] uppercase tracking-[0.04em] text-[#5b6b82] 2xl:block">
                {workspaceLabel(pathname)}
            </p>
            <span className="flex-1 2xl:hidden" />

            <div className="flex items-center gap-1 sm:gap-2">
                <button aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0f1b2d] hover:bg-slate-100">
                    <Search size={20} />
                </button>
                <button aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#0f1b2d] hover:bg-slate-100">
                    <Bell size={20} />
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#e02424]" />
                </button>
                <div ref={menuRef} className="relative ml-1">
                    <button
                        onClick={() => setMenuOpen(open => !open)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 hover:bg-slate-50"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1257e0] text-xs font-bold text-white">
                            {initials}
                        </span>
                        <span className="hidden max-w-32 truncate text-[14px] font-semibold text-[#0f1b2d] sm:block">{user.fullName}</span>
                        <ChevronDown size={15} className="hidden text-slate-500 sm:block" />
                    </button>
                    {menuOpen && (
                        <div role="menu" className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-[#e3e8f0] bg-white p-1.5 shadow-xl shadow-slate-900/10">
                            <div className="border-b border-[#e3e8f0] px-3 pb-2.5 pt-1.5">
                                <p className="truncate text-sm font-semibold text-[#0f1b2d]">{user.fullName}</p>
                                <p className="truncate text-xs text-[#5b6b82]">{user.email}</p>
                                <p className="mt-1 text-[11px] font-semibold text-[#1257e0]">{humanizeRole(user.role)}</p>
                            </div>
                            <button
                                role="menuitem"
                                onClick={logout}
                                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={16} /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
