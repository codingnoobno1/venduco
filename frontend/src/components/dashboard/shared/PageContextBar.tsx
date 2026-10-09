"use client"

import Link from 'next/link'
import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const AREA_LABELS: Record<string, string> = {
    admin: 'Administration',
    pm: 'Project Delivery',
    vendor: 'Vendor Portal',
    supervisor: 'Site Supervision',
    consultant: 'Consultant Review',
    contractor: 'Contractor',
    subcontractor: 'Subcontractor',
    company: 'Company',
    guest: 'Guest',
}

function labelFor(segment: string, index: number) {
    if (index === 1 && AREA_LABELS[segment]) return AREA_LABELS[segment]
    if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) return 'Details'
    if (segment === 'new') return 'New'
    return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, character => character.toUpperCase())
}

/** Breadcrumb trail and today's date above every dashboard page, as in the redesign screens. */
export function PageContextBar() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)
    const crumbs = segments.map((segment, index) => ({
        href: `/${segments.slice(0, index + 1).join('/')}`,
        label: index === 0 ? 'Dashboard' : labelFor(segment, index),
    }))
    const today = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date())
        .replace(/,/g, '')
        .replace(/^(\w+)/, '$1,')

    return (
        <div className="mb-2 flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[12.5px] text-[#5b6b82]">
                {crumbs.map((crumb, index) => {
                    const last = index === crumbs.length - 1
                    return (
                        <Fragment key={crumb.href}>
                            {index > 0 && <ChevronRight size={13} className="shrink-0 text-slate-400" aria-hidden />}
                            {last ? (
                                <span aria-current="page" className="truncate font-semibold text-[#0f1b2d]">{crumb.label}</span>
                            ) : (
                                <Link href={index === 0 ? '/dashboard' : crumb.href} className="truncate hover:text-[#1257e0]">{crumb.label}</Link>
                            )}
                        </Fragment>
                    )
                })}
            </nav>
            <p className="hidden shrink-0 text-[12.5px] text-[#5b6b82] sm:block">{today}</p>
        </div>
    )
}
