"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
    AlertTriangle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    FileCheck2,
    FolderKanban,
    Layers3,
    ShieldCheck,
    Truck,
    Users,
    Wrench,
} from 'lucide-react'
import apiRequest from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import VendorDashboardInsights from '@/components/dashboard/redesign/VendorDashboardInsights'

export type DashboardVariant = 'pm' | 'vendor' | 'admin' | 'supervisor'
type Tone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate'
type DataRecord = Record<string, unknown>

interface Metric {
    label: string
    value: string
    detail: string
    icon: LucideIcon
    tone: Tone
    progress?: number
}

interface DashboardMeta {
    eyebrow: string
    title: string
    subtitle: string
    actionLabel: string
    actionHref: string
    tableTitle: string
    tableTabs: string[]
    decisionTitle: string
    healthTitle: string
    endpoints: string[]
    primarySource: number
}

const toneStyles: Record<Tone, { icon: string; soft: string; text: string; bar: string }> = {
    blue: { icon: 'bg-[#e8f0ff] text-[#1257e0]', soft: 'bg-[#e8f0ff]', text: 'text-[#1257e0]', bar: 'bg-[#1257e0]' },
    green: { icon: 'bg-[#e4f6ec] text-[#12a150]', soft: 'bg-[#e4f6ec]', text: 'text-[#0d7a3c]', bar: 'bg-[#12a150]' },
    amber: { icon: 'bg-[#fff3dc] text-[#e08a00]', soft: 'bg-[#fff3dc]', text: 'text-[#a86400]', bar: 'bg-[#e08a00]' },
    red: { icon: 'bg-[#fde8e8] text-[#e02424]', soft: 'bg-[#fde8e8]', text: 'text-[#c81e1e]', bar: 'bg-[#e02424]' },
    violet: { icon: 'bg-violet-50 text-violet-600', soft: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-violet-500' },
    slate: { icon: 'bg-slate-100 text-slate-600', soft: 'bg-slate-100', text: 'text-slate-700', bar: 'bg-slate-500' },
}

const dashboardMeta: Record<DashboardVariant, DashboardMeta> = {
    pm: {
        eyebrow: 'PROJECT MANAGER DASHBOARD',
        title: 'Portfolio Delivery Cockpit',
        subtitle: 'Track progress, manage risks and take action to keep projects on schedule.',
        actionLabel: 'New project',
        actionHref: '/dashboard/pm/projects/new',
        tableTitle: 'Project Portfolio',
        tableTabs: ['All Projects', 'On Track', 'At Risk', 'Delayed'],
        decisionTitle: 'Needs Your Decision',
        healthTitle: 'Portfolio Health',
        endpoints: ['/projects/my', '/issues', '/tasks'],
        primarySource: 0,
    },
    vendor: {
        eyebrow: 'VENDOR OPERATIONS',
        title: 'Fleet & Commercial Overview',
        subtitle: 'Your fleet, assignments, requests and earnings at a glance.',
        actionLabel: 'View requests',
        actionHref: '/dashboard/vendor/requests',
        tableTitle: 'Fleet & Assignments',
        tableTabs: ['All Assets', 'Available', 'Assigned', 'Maintenance'],
        decisionTitle: 'Requests Queue',
        healthTitle: 'Commercial Summary',
        endpoints: ['/machines', '/machinerentals?view=vendor-requests', '/bids/my'],
        primarySource: 0,
    },
    admin: {
        eyebrow: 'PLATFORM ADMINISTRATION',
        title: 'Operations Control Centre',
        subtitle: 'Monitor platform adoption, approvals and delivery health across the network.',
        actionLabel: 'Review users',
        actionHref: '/dashboard/admin/users',
        tableTitle: 'Portfolio Oversight',
        tableTabs: ['All Projects', 'Active', 'At Risk', 'Completed'],
        decisionTitle: 'Pending Verifications',
        healthTitle: 'Platform Health',
        endpoints: ['/admin/users', '/projects', '/machines'],
        primarySource: 1,
    },
    supervisor: {
        eyebrow: 'SITE SUPERVISOR DASHBOARD',
        title: 'Field Execution Desk',
        subtitle: 'Track today’s plan, site constraints and assigned work in one place.',
        actionLabel: 'Submit daily report',
        actionHref: '/dashboard/supervisor/reports/new',
        tableTitle: 'Assigned Activities',
        tableTabs: ['All Activities', 'In Progress', 'Blocked', 'Completed'],
        decisionTitle: 'Blockers & Issues',
        healthTitle: 'Field Summary',
        endpoints: ['/projects/assigned', '/tasks/assigned', '/reports/my'],
        primarySource: 1,
    },
}

function recordsFrom(response: unknown): DataRecord[] {
    if (Array.isArray(response)) return response.filter(item => item && typeof item === 'object') as DataRecord[]
    if (!response || typeof response !== 'object') return []

    const container = response as Record<string, unknown>
    for (const key of ['data', 'content', 'items', 'results']) {
        if (Array.isArray(container[key])) {
            return (container[key] as unknown[]).filter(item => item && typeof item === 'object') as DataRecord[]
        }
    }
    return []
}

function textValue(record: DataRecord, keys: string[], fallback = '—') {
    for (const key of keys) {
        const value = key.split('.').reduce<unknown>((current, segment) => {
            if (!current || typeof current !== 'object') return undefined
            return (current as Record<string, unknown>)[segment]
        }, record)
        if (typeof value === 'string' && value.trim()) return value
        if (typeof value === 'number') return String(value)
    }
    return fallback
}

function numberValue(record: DataRecord, keys: string[]) {
    for (const key of keys) {
        const value = record[key]
        if (typeof value === 'number' && Number.isFinite(value)) return value
        if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
    }
    return 0
}

function itemStatus(record: DataRecord) {
    return textValue(record, ['status', 'registrationStatus', 'riskLevel', 'state'], 'Recorded')
}

function toneForStatus(status: string): Tone {
    const value = status.toUpperCase()
    if (/CRITICAL|HIGH|DELAY|OVERDUE|REJECT|BLOCK|FAILED|EXPIRED/.test(value)) return 'red'
    if (/PENDING|REVIEW|SUBMIT|MEDIUM|MAINTENANCE|DUE|REQUEST/.test(value)) return 'amber'
    if (/ACTIVE|APPROVED|AVAILABLE|COMPLETE|LOW|PAID|VERIFIED|ON_TRACK/.test(value)) return 'green'
    return 'blue'
}

function formatLabel(value: string) {
    return value
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, character => character.toUpperCase())
}

function formatDate(value: string) {
    if (value === '—') return value
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function initials(name: string) {
    if (name === '—') return '—'
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function countWhere(records: DataRecord[], expression: RegExp) {
    return records.filter(record => expression.test(itemStatus(record).toUpperCase())).length
}

function progressOf(record: DataRecord) {
    return Math.max(0, Math.min(100, numberValue(record, ['progress', 'completionPercentage', 'percentage', 'utilization', 'actualProgress'])))
}

function metricsFor(variant: DashboardVariant, sources: DataRecord[][]): Metric[] {
    const [first, second, third] = sources
    if (variant === 'pm') {
        const active = countWhere(first, /ACTIVE|IN_PROGRESS|ON_TRACK/)
        const pendingApprovals = third.filter(record => /PENDING|REVIEW|SUBMITTED/.test(itemStatus(record).toUpperCase())).length
        const delayed = first.filter(record => /DELAY|AT_RISK|BLOCKED|HIGH/.test(itemStatus(record).toUpperCase())).length
        const exposure = first.reduce((sum, record) => sum + numberValue(record, ['budgetExposure', 'forecastVariance', 'atRiskValue']), 0)
        return [
            { label: 'Active Projects', value: String(active), detail: `${first.length} projects in scope`, icon: Layers3, tone: 'blue' },
            { label: 'Pending Approvals', value: String(pendingApprovals), detail: 'Require your review', icon: ClipboardCheck, tone: pendingApprovals > 0 ? 'amber' : 'green' },
            { label: 'Delayed Packages', value: String(delayed), detail: `${second.length} issues tracked`, icon: AlertTriangle, tone: delayed > 0 ? 'red' : 'green' },
            { label: 'Budget Exposure', value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(exposure), detail: 'Across permitted projects', icon: FileCheck2, tone: exposure > 0 ? 'amber' : 'blue' },
        ]
    }
    if (variant === 'vendor') {
        const available = countWhere(first, /AVAILABLE/)
        const maintenance = countWhere(first, /MAINTENANCE|SERVICE/)
        const pendingRequests = second.length - countWhere(second, /APPROVED|REJECTED|CLOSED|COMPLETED/)
        return [
            { label: 'Total Fleet', value: String(first.length), detail: `${available} available`, icon: Truck, tone: 'blue' },
            { label: 'Available', value: String(available), detail: 'Ready for assignment', icon: CheckCircle2, tone: 'green' },
            { label: 'Pending Requests', value: String(Math.max(0, pendingRequests)), detail: `${second.length} total requests`, icon: FileCheck2, tone: pendingRequests > 0 ? 'amber' : 'green' },
            { label: 'In Maintenance', value: String(maintenance), detail: `${third.length} bids tracked`, icon: Wrench, tone: maintenance > 0 ? 'amber' : 'green' },
        ]
    }
    if (variant === 'admin') {
        const pendingUsers = countWhere(first, /PENDING|UNVERIFIED|REVIEW/)
        const activeProjects = countWhere(second, /ACTIVE|IN_PROGRESS|ON_TRACK/)
        const availableMachines = countWhere(third, /AVAILABLE/)
        return [
            { label: 'Total Users', value: String(first.length), detail: `${pendingUsers} pending verification`, icon: Users, tone: 'blue' },
            { label: 'Active Projects', value: String(activeProjects), detail: `${second.length} total projects`, icon: FolderKanban, tone: 'green' },
            { label: 'Available Machines', value: String(availableMachines), detail: `${third.length} registered assets`, icon: Truck, tone: 'blue' },
            { label: 'Pending Verifications', value: String(pendingUsers), detail: 'Require administrator review', icon: ShieldCheck, tone: pendingUsers > 0 ? 'amber' : 'green' },
        ]
    }

    const openTasks = second.length - countWhere(second, /COMPLETED|CLOSED/)
    const blockedTasks = countWhere(second, /BLOCKED|DELAYED|OVERDUE/)
    return [
        { label: 'Assigned Projects', value: String(first.length), detail: 'Projects in your scope', icon: FolderKanban, tone: 'blue' },
        { label: 'Assigned Tasks', value: String(second.length), detail: `${Math.max(0, openTasks)} open`, icon: ClipboardCheck, tone: 'blue' },
        { label: 'Blocked Tasks', value: String(blockedTasks), detail: 'Require field action', icon: AlertTriangle, tone: blockedTasks > 0 ? 'red' : 'green' },
        { label: 'Submitted Reports', value: String(third.length), detail: 'Visible in your workspace', icon: FileCheck2, tone: 'green' },
    ]
}

function healthFor(variant: DashboardVariant, sources: DataRecord[][]) {
    const [first, second, third] = sources
    if (variant === 'pm') {
        const progresses = first.map(progressOf).filter(value => value > 0)
        const average = progresses.length ? Math.round(progresses.reduce((sum, value) => sum + value, 0) / progresses.length) : 0
        return [
            ['Projects in scope', String(first.length), 'blue' as Tone],
            ['Average progress', `${average}%`, 'blue' as Tone],
            ['Issues tracked', String(second.length), second.length ? 'amber' as Tone : 'green' as Tone],
            ['Tasks tracked', String(third.length), 'slate' as Tone],
        ]
    }
    if (variant === 'vendor') {
        return [
            ['Registered assets', String(first.length), 'blue' as Tone],
            ['Available assets', String(countWhere(first, /AVAILABLE/)), 'green' as Tone],
            ['Rental requests', String(second.length), second.length ? 'amber' as Tone : 'green' as Tone],
            ['Bids submitted', String(third.length), 'blue' as Tone],
        ]
    }
    if (variant === 'admin') {
        return [
            ['Registered users', String(first.length), 'blue' as Tone],
            ['Pending users', String(countWhere(first, /PENDING|UNVERIFIED|REVIEW/)), 'amber' as Tone],
            ['Projects', String(second.length), 'green' as Tone],
            ['Machines', String(third.length), 'blue' as Tone],
        ]
    }
    return [
        ['Assigned projects', String(first.length), 'blue' as Tone],
        ['Open tasks', String(Math.max(0, second.length - countWhere(second, /COMPLETED|CLOSED/))), 'amber' as Tone],
        ['Completed tasks', String(countWhere(second, /COMPLETED|CLOSED/)), 'green' as Tone],
        ['Reports submitted', String(third.length), 'blue' as Tone],
    ]
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Layers3 size={21} />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-700">{message}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Data will appear here when it is available from the secured service.</p>
        </div>
    )
}

function matchesTab(record: DataRecord, tab: string, tabs: string[]) {
    if (tab === tabs[0]) return true
    const filter = tab.toUpperCase().replace(/\s+/g, '_')
    const status = itemStatus(record).toUpperCase()
    if (filter === 'AT_RISK') return /HIGH|MEDIUM|RISK|DELAY|BLOCK/.test(status)
    return status.includes(filter) || status.includes(filter.replace('_', ' '))
}

function StatusChip({ status }: { status: string }) {
    const tone = toneStyles[toneForStatus(status)]
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tone.soft} ${tone.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.bar}`} />
            {formatLabel(status)}
        </span>
    )
}

function Avatar({ name }: { name: string }) {
    return (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[10.5px] font-bold text-[#1257e0]">
            {initials(name)}
        </span>
    )
}

export function RoleDashboard({ variant }: { variant: DashboardVariant }) {
    const { user } = useAuth()
    const meta = dashboardMeta[variant]
    const [activeTab, setActiveTab] = useState(meta.tableTabs[0])
    const [sources, setSources] = useState<DataRecord[][]>(() => meta.endpoints.map(() => []))
    const [loading, setLoading] = useState(true)
    const [allUnavailable, setAllUnavailable] = useState(false)

    useEffect(() => {
        let cancelled = false

        Promise.all(meta.endpoints.map(endpoint =>
            apiRequest<unknown>(endpoint)
                .then(response => ({ ok: true, records: recordsFrom(response) }))
                .catch(() => ({ ok: false, records: [] as DataRecord[] }))
        )).then(results => {
            if (cancelled) return
            setSources(results.map(result => result.records))
            setAllUnavailable(results.every(result => !result.ok))
            setLoading(false)
        })

        return () => { cancelled = true }
    }, [meta.endpoints])

    const metrics = useMemo(() => metricsFor(variant, sources), [variant, sources])
    const health = useMemo(() => healthFor(variant, sources), [variant, sources])
    const primaryRecords = useMemo(
        () => sources[meta.primarySource] || [],
        [meta.primarySource, sources],
    )

    const filteredRecords = useMemo(
        () => primaryRecords.filter(record => matchesTab(record, activeTab, meta.tableTabs)),
        [activeTab, meta.tableTabs, primaryRecords],
    )

    const tabCounts = useMemo(
        () => meta.tableTabs.map(tab => primaryRecords.filter(record => matchesTab(record, tab, meta.tableTabs)).length),
        [meta.tableTabs, primaryRecords],
    )

    const decisionRecords = useMemo(() => {
        const candidates = sources
            .filter((_, index) => index !== meta.primarySource)
            .flat()
            .filter(record => !/APPROVED|COMPLETED|CLOSED|RESOLVED|PAID/.test(itemStatus(record).toUpperCase()))
        return candidates.slice(0, 5)
    }, [meta.primarySource, sources])

    const milestoneRecords = useMemo(() => primaryRecords.filter(record =>
        textValue(record, ['deadline', 'endDate', 'dueDate', 'closingDate', 'updatedAt']) !== '—'
    ).slice(0, 6), [primaryRecords])

    const displayName = user?.fullName?.split(' ')[0] || ''

    return (
        <div className="dashboard-canvas mx-auto w-full max-w-[1600px] space-y-3.5 pb-6">
            <section className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="dashboard-eyebrow">{meta.eyebrow}</p>
                    <h1 className="mt-0.5 text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-[#0f1b2d] sm:text-[32px]">{meta.title}</h1>
                    <p className="mt-0.5 text-[14px] text-[#5b6b82] sm:text-[15px]">{meta.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    {displayName && (
                        <p className="hidden text-right text-xs text-[#5b6b82] sm:block">
                            Welcome back, <span className="font-semibold text-[#0f1b2d]">{displayName}</span>
                        </p>
                    )}
                    <Link href={meta.actionHref} className="dashboard-primary-button">
                        <span className="text-lg leading-none">+</span>
                        {meta.actionLabel}
                    </Link>
                </div>
            </section>

            {allUnavailable && (
                <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                    Dashboard services are currently unavailable. No placeholder or sample business data is being shown.
                </div>
            )}

            <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4" aria-busy={loading}>
                {metrics.map(metric => {
                    const Icon = metric.icon
                    return (
                        <article key={metric.label} className="dashboard-panel min-h-[110px] px-5 py-4">
                            <div className="flex items-start gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneStyles[metric.tone].icon}`}>
                                    <Icon size={24} strokeWidth={1.8} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14px] font-medium text-[#26364d]">{metric.label}</p>
                                    <p className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.02em] text-[#0f1b2d]">{loading ? '—' : metric.value}</p>
                                    <p className={`mt-2 text-[13px] ${metric.tone === 'red' ? 'text-[#e02424]' : metric.tone === 'amber' ? 'text-[#a86400]' : 'text-[#5b6b82]'}`}>
                                        {loading ? 'Loading secured data…' : metric.detail}
                                    </p>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </section>

            <section className="grid grid-cols-1 gap-3.5 2xl:grid-cols-[minmax(0,1fr)_380px]">
                <article className="dashboard-panel min-w-0 overflow-hidden">
                    <div className="flex flex-col gap-2 px-4 pb-1 pt-3 lg:flex-row lg:items-center lg:justify-between">
                        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0f1b2d]">{meta.tableTitle}</h2>
                        <div className="flex max-w-full items-center gap-1 overflow-x-auto" role="tablist">
                            {meta.tableTabs.map((tab, index) => {
                                const active = activeTab === tab
                                return (
                                    <button
                                        key={tab}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition ${active ? 'border-[#1257e0] text-[#1257e0]' : 'border-transparent text-[#5b6b82] hover:text-[#0f1b2d]'}`}
                                    >
                                        {tab}
                                        {!loading && (
                                            <span className={`rounded px-1.5 text-[11px] font-semibold ${active ? 'bg-[#e8f0ff] text-[#1257e0]' : 'bg-[#eef1f5] text-[#5b6b82]'}`}>
                                                {tabCounts[index]}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-3 p-4" aria-label="Loading records">
                            {[0, 1, 2, 3].map(row => <div key={row} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <EmptyState message={activeTab === meta.tableTabs[0] ? 'No records are available yet' : `No records match “${activeTab}”`} />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="vc-table min-w-[900px]">
                                    <thead>
                                        <tr>
                                            <th className="w-10 pl-4">#</th>
                                            <th>Record / Asset</th>
                                            <th>Owner</th>
                                            <th>Progress</th>
                                            <th>Forecast / Updated</th>
                                            <th>Status</th>
                                            <th>Next Key Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.slice(0, 8).map((record, index) => {
                                            const name = textValue(record, ['name', 'title', 'projectName', 'machineType', 'fullName', 'referenceNumber'], `Record ${index + 1}`)
                                            const detail = textValue(record, ['projectCode', 'machineCode', 'location', 'email', 'description'])
                                            const owner = textValue(record, ['ownerName', 'managerName', 'vendorName', 'requestedByName', 'role', 'organizationName'])
                                            const progress = progressOf(record)
                                            const date = formatDate(textValue(record, ['deadline', 'endDate', 'dueDate', 'closingDate', 'updatedAt', 'createdAt']))
                                            const status = itemStatus(record)
                                            const action = textValue(record, ['nextAction', 'action', 'currentStage'], 'Open record')
                                            const id = textValue(record, ['id', '_id'], `${name}-${index}`)
                                            return (
                                                <tr key={id} className="group">
                                                    <td className="pl-4 text-[#5b6b82]">{index + 1}</td>
                                                    <td>
                                                        <p className="font-semibold text-[#0f1b2d]">{name}</p>
                                                        <p className="mt-0.5 max-w-64 truncate text-[11.5px] text-[#5b6b82]">{detail}</p>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar name={owner} />
                                                            <span className="text-[#26364d]">{owner}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p className="mb-1 text-[12px] font-semibold text-[#0f1b2d]">{progress}%</p>
                                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#e8edf5]">
                                                            <div className="h-full rounded-full bg-[#1257e0]" style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </td>
                                                    <td className="text-[#26364d]">{date}</td>
                                                    <td><StatusChip status={status} /></td>
                                                    <td>
                                                        <div className="flex items-center justify-between gap-2 text-[#26364d]">
                                                            <span className="max-w-44">{action}</span>
                                                            <ChevronRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1257e0]" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#edf1f6] px-4 py-2.5 text-xs text-[#5b6b82]">
                                <span>Showing {Math.min(filteredRecords.length, 8)} of {filteredRecords.length} records</span>
                                <span className="font-semibold text-[#1257e0]">Secured API data</span>
                            </div>
                        </>
                    )}
                </article>

                <aside className="dashboard-panel flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
                        <h2 className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.01em] text-[#0f1b2d]">
                            {meta.decisionTitle}
                            {!loading && <span className="rounded-full bg-[#e02424] px-2 py-0.5 text-[11px] font-bold text-white">{decisionRecords.length}</span>}
                        </h2>
                        <Link href={meta.actionHref} className="text-[13px] font-semibold text-[#1257e0] hover:underline">View All</Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3 p-4">
                            {[0, 1, 2].map(row => <div key={row} className="h-20 animate-pulse rounded-lg bg-slate-100" />)}
                        </div>
                    ) : decisionRecords.length === 0 ? (
                        <EmptyState message="No pending decisions" />
                    ) : (
                        <div className="flex-1 divide-y divide-[#edf1f6]">
                            {decisionRecords.map((record, index) => {
                                const title = textValue(record, ['title', 'name', 'projectName', 'machineName', 'fullName', 'referenceNumber'], `Item ${index + 1}`)
                                const detail = textValue(record, ['projectName', 'description', 'message', 'email', 'machineType'])
                                const owner = textValue(record, ['ownerName', 'requestedByName', 'submittedByName', 'vendorName', 'role'])
                                const due = formatDate(textValue(record, ['dueDate', 'deadline', 'closingDate', 'updatedAt', 'createdAt']))
                                const status = itemStatus(record)
                                const tone = toneForStatus(status)
                                const id = textValue(record, ['id', '_id'], `${title}-${index}`)
                                return (
                                    <div key={id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f8ff]">
                                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone].icon}`}>
                                            {tone === 'red' ? <AlertTriangle size={21} /> : tone === 'green' ? <CheckCircle2 size={21} /> : <ClipboardCheck size={21} />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13.5px] font-semibold text-[#0f1b2d]">{title}</span>
                                            <span className="block truncate text-[12px] text-[#5b6b82]">{detail}</span>
                                            <span className="mt-1.5 flex items-center justify-between gap-2 text-[12px]">
                                                <span className="flex min-w-0 items-center gap-1.5">
                                                    {owner !== '—' && <Avatar name={owner} />}
                                                    <span className="truncate text-[#26364d]">{owner}</span>
                                                </span>
                                                <span className="flex shrink-0 items-center gap-1 font-medium text-[#e02424]">
                                                    <CalendarDays size={14} /> {due}
                                                </span>
                                            </span>
                                        </span>
                                        <ChevronRight size={17} className="shrink-0 text-slate-400" />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div className="p-3">
                        <Link href={meta.actionHref} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1257e0] text-sm font-semibold text-white shadow-sm shadow-blue-700/20 hover:bg-[#0f4bc4]">
                            Review all <ArrowRight size={16} />
                        </Link>
                    </div>
                </aside>
            </section>

            <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
                <article className="dashboard-panel overflow-hidden">
                    <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
                        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0f1b2d]">{meta.healthTitle}</h2>
                        <Clock3 size={17} className="text-slate-400" />
                    </div>
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th className="pl-4">Measure</th>
                                <th className="text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {health.map(([label, value, tone]) => (
                                <tr key={label}>
                                    <td className="pl-4 text-[#26364d]">{label}</td>
                                    <td className={`text-right text-[14px] font-bold ${toneStyles[tone as Tone].text}`}>{loading ? '—' : value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </article>

                <article className="dashboard-panel overflow-hidden">
                    <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
                        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0f1b2d]">Key Milestones</h2>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e8f0] px-2.5 py-1 text-xs font-medium text-[#26364d]"><CalendarDays size={14} /> Live programme</span>
                    </div>
                    {loading ? (
                        <div className="m-4 h-28 animate-pulse rounded-lg bg-slate-100" />
                    ) : milestoneRecords.length === 0 ? (
                        <div className="flex min-h-32 items-center justify-center px-4 text-center text-xs text-[#5b6b82]">No dated milestones are available from the service.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="vc-table min-w-[560px]">
                                <tbody>
                                    {milestoneRecords.map((record, index) => {
                                        const label = textValue(record, ['name', 'title', 'projectName', 'machineType'], `Milestone ${index + 1}`)
                                        const context = textValue(record, ['projectCode', 'location', 'machineCode', 'organizationName'], '')
                                        const status = itemStatus(record)
                                        const date = formatDate(textValue(record, ['deadline', 'endDate', 'dueDate', 'closingDate', 'updatedAt']))
                                        const id = textValue(record, ['id', '_id'], `${label}-${index}`)
                                        return (
                                            <tr key={id}>
                                                <td className="w-28 whitespace-nowrap pl-4 text-[#26364d]">{date}</td>
                                                <td className="w-6 px-0"><span className={`block h-2.5 w-2.5 rounded-full ${toneStyles[toneForStatus(status)].bar}`} /></td>
                                                <td className="font-medium text-[#0f1b2d]">{label}</td>
                                                <td className="text-[#5b6b82]">{context}</td>
                                                <td className="text-right"><StatusChip status={status} /></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </article>
            </section>
            {variant === 'vendor' && <VendorDashboardInsights />}
        </div>
    )
}
