"use client"

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ChevronRight, Database, RefreshCw, Search } from 'lucide-react'
import apiRequest from '@/lib/api'

export type BusinessRecord = Record<string, any>
export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate'

const toneClasses: Record<Tone, { icon: string; badge: string; bar: string; dot: string }> = {
    blue: { icon: 'bg-[#e8f0ff] text-[#1257e0]', badge: 'bg-[#e8f0ff] text-[#1257e0]', bar: 'bg-[#1257e0]', dot: 'bg-[#1257e0]' },
    green: { icon: 'bg-[#e4f6ec] text-[#12a150]', badge: 'bg-[#e4f6ec] text-[#0d7a3c]', bar: 'bg-[#12a150]', dot: 'bg-[#12a150]' },
    amber: { icon: 'bg-[#fff3dc] text-[#e08a00]', badge: 'bg-[#fff3dc] text-[#a86400]', bar: 'bg-[#e08a00]', dot: 'bg-[#e08a00]' },
    red: { icon: 'bg-[#fde8e8] text-[#e02424]', badge: 'bg-[#fde8e8] text-[#c81e1e]', bar: 'bg-[#e02424]', dot: 'bg-[#e02424]' },
    violet: { icon: 'bg-[#efe7ff] text-[#7c3aed]', badge: 'bg-[#efe7ff] text-[#6d28d9]', bar: 'bg-[#7c3aed]', dot: 'bg-[#7c3aed]' },
    slate: { icon: 'bg-[#eef1f5] text-[#5b6b82]', badge: 'bg-[#eef1f5] text-[#4a5a70]', bar: 'bg-[#5b6b82]', dot: 'bg-[#8a97ab]' },
}

export function recordsFrom(payload: unknown): BusinessRecord[] {
    if (Array.isArray(payload)) return payload.filter(Boolean) as BusinessRecord[]
    if (!payload || typeof payload !== 'object') return []
    const object = payload as BusinessRecord
    for (const key of ['data', 'content', 'items', 'results', 'records']) {
        if (Array.isArray(object[key])) return object[key].filter(Boolean)
        if (object[key] && typeof object[key] === 'object') return [object[key]]
    }
    return object.id || object._id ? [object] : []
}

export function field(record: BusinessRecord | undefined, keys: string[], fallback: any = '—'): any {
    if (!record) return fallback
    for (const key of keys) {
        const value = key.split('.').reduce<any>((current, segment) => current?.[segment], record)
        if (value !== undefined && value !== null && value !== '') return value
    }
    return fallback
}

export function numberField(record: BusinessRecord | undefined, keys: string[]) {
    const value = field(record, keys, 0)
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

export function percentage(value: unknown) {
    const parsed = Number(value)
    return Math.max(0, Math.min(100, Number.isFinite(parsed) ? parsed : 0))
}

export function formatMoney(value: unknown) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return '₹0'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parsed)
}

export function formatDate(value: unknown) {
    if (!value || value === '—') return '—'
    const parsed = new Date(String(value))
    if (Number.isNaN(parsed.getTime())) return String(value)
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed)
}

export function toneFor(value: unknown): Tone {
    const status = String(value || '').toUpperCase()
    if (/CRITICAL|HIGH|DELAY|OVERDUE|BLOCK|REJECT|EXPIRED|SHORTAGE|OPEN/.test(status)) return 'red'
    if (/PENDING|REVIEW|RISK|MEDIUM|DUE|MAINTENANCE|REQUEST/.test(status)) return 'amber'
    if (/ACTIVE|APPROVED|AVAILABLE|COMPLETE|LOW|PAID|VALID|CERTIFIED|ON_TRACK/.test(status)) return 'green'
    return 'blue'
}

export function useApiSources(endpoints: string[]) {
    const key = endpoints.join('|')
    const [sources, setSources] = useState<BusinessRecord[][]>(() => endpoints.map(() => []))
    const [loading, setLoading] = useState(true)
    const [failed, setFailed] = useState<string[]>([])
    const [revision, setRevision] = useState(0)

    useEffect(() => {
        let active = true
        setLoading(true)
        Promise.all(endpoints.map(async endpoint => {
            try {
                return { endpoint, records: recordsFrom(await apiRequest<unknown>(endpoint)), ok: true }
            } catch {
                return { endpoint, records: [] as BusinessRecord[], ok: false }
            }
        })).then(results => {
            if (!active) return
            setSources(results.map(result => result.records))
            setFailed(results.filter(result => !result.ok).map(result => result.endpoint))
            setLoading(false)
        })
        return () => { active = false }
    }, [key, revision])

    return { sources, loading, failed, refresh: () => setRevision(value => value + 1) }
}

export function WorkspaceHeader({ eyebrow, title, subtitle, actions }: {
    eyebrow?: string
    title: string
    subtitle: string
    actions?: ReactNode
}) {
    return (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
                {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5b6b82]">{eyebrow}</p>}
                <h1 className="mt-0.5 text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-[#0f1b2d] sm:text-[31px]">{title}</h1>
                <p className="mt-0.5 text-[14px] text-[#5b6b82] sm:text-[15px]">{subtitle}</p>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}

export function PrimaryButton({ children, onClick, disabled = false }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
    return <button disabled={disabled} onClick={onClick} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1257e0] px-4 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 hover:bg-[#0f4bc4] disabled:cursor-not-allowed disabled:opacity-50">{children}</button>
}

export function SecondaryButton({ children, onClick, disabled = false }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
    return <button disabled={disabled} onClick={onClick} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#1257e0]/70 bg-white px-4 text-sm font-semibold text-[#1257e0] hover:bg-[#e8f0ff] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:opacity-60">{children}</button>
}

export function ServiceNotice({ failed }: { failed: string[] }) {
    if (!failed.length) return null
    return (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div><strong>Some live services are unavailable.</strong> Unavailable sections remain empty; no sample business data is substituted.</div>
        </div>
    )
}

export function MetricGrid({ items }: { items: Array<{ label: string; value: ReactNode; detail?: string; icon: LucideIcon; tone?: Tone; progress?: number }> }) {
    return (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {items.map(item => {
                const Icon = item.icon
                const tone = toneClasses[item.tone || 'blue']
                return (
                    <div key={item.label} className="rounded-[10px] border border-[#e3e8f0] bg-white px-5 py-4">
                        <div className="flex items-start gap-4">
                            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}><Icon size={24} strokeWidth={1.8} /></span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-medium text-[#26364d]">{item.label}</p>
                                <div className="mt-0.5 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-[#0f1b2d]">{item.value}</div>
                                {item.detail && <p className="mt-1 truncate text-[13px] text-[#5b6b82]">{item.detail}</p>}
                                {item.progress !== undefined && (
                                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#e8edf5]"><div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${percentage(item.progress)}%` }} /></div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export function Panel({ title, subtitle, action, children, className = '' }: {
    title: string
    subtitle?: string
    action?: ReactNode
    children: ReactNode
    className?: string
}) {
    return (
        <section className={`overflow-hidden rounded-[10px] border border-[#e3e8f0] bg-white ${className}`}>
            <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-3 border-b border-[#e3e8f0] px-4 py-3">
                <div><h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#0f1b2d]">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-[#5b6b82]">{subtitle}</p>}</div>
                {action}
            </header>
            {children}
        </section>
    )
}

export function EmptyRows({ message = 'No records are available from the secured service.' }: { message?: string }) {
    return (
        <div className="flex min-h-36 flex-col items-center justify-center px-6 py-8 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Database size={19} /></span>
            <p className="text-sm font-semibold text-slate-700">No records available</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{message}</p>
        </div>
    )
}

export function StatusPill({ value }: { value: unknown }) {
    const label = String(value || 'Recorded').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, character => character.toUpperCase())
    const tone = toneClasses[toneFor(value)]
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tone.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
            {label}
        </span>
    )
}

export interface GridColumn {
    label: string
    keys: string[]
    render?: (record: BusinessRecord) => ReactNode
    className?: string
}

export function DenseTable({ records, columns, onSelect, selectedId, emptyMessage }: {
    records: BusinessRecord[]
    columns: GridColumn[]
    onSelect?: (record: BusinessRecord) => void
    selectedId?: unknown
    emptyMessage?: string
}) {
    if (!records.length) return <EmptyRows message={emptyMessage} />
    return (
        <div className="overflow-x-auto">
            <table className="vc-table min-w-[720px]">
                <thead>
                    <tr>{columns.map(column => <th key={column.label} className={`px-4 ${column.className || ''}`}>{column.label}</th>)}</tr>
                </thead>
                <tbody>
                    {records.map((record, index) => {
                        const id = field(record, ['id', '_id', 'code'], index)
                        return (
                            <tr key={String(id)} onClick={() => onSelect?.(record)} className={`${onSelect ? 'cursor-pointer' : ''} ${selectedId === id ? '[&>td]:bg-[#e8f0ff]' : ''}`}>
                                {columns.map(column => <td key={column.label} className={`px-4 text-[#26364d] ${column.className || ''}`}>{column.render ? column.render(record) : String(field(record, column.keys))}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export function SearchBar({ value, onChange, placeholder = 'Search records…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
    return (
        <label className="relative block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="h-9 w-64 rounded-lg border border-[#e3e8f0] bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-slate-400 focus:border-[#1257e0] focus:ring-2 focus:ring-[#e8f0ff]" />
        </label>
    )
}

export function RefreshButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
    return <SecondaryButton onClick={onClick} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</SecondaryButton>
}

export function KeyValueList({ rows }: { rows: Array<[string, ReactNode]> }) {
    return <dl className="divide-y divide-[#edf1f6]">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 px-4 py-2.5 text-[13px]"><dt className="text-[#5b6b82]">{label}</dt><dd className="font-medium text-[#0f1b2d]">{value}</dd></div>)}</dl>
}

export function Inspector({ title, status, children }: { title: string; status?: unknown; children: ReactNode }) {
    return (
        <aside className="overflow-hidden rounded-[10px] border border-[#e3e8f0] bg-white">
            <header className="flex min-h-[52px] items-center justify-between border-b border-[#e3e8f0] px-4 py-3">
                <h2 className="text-[17px] font-bold text-[#0f1b2d]">{title}</h2>
                <div className="flex items-center gap-2">{status !== undefined && status !== null && <StatusPill value={status} />}<ChevronRight size={17} className="text-slate-400" /></div>
            </header>
            {children}
        </aside>
    )
}

export function TabStrip({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
    return <div className="flex gap-1 overflow-x-auto border-b border-[#e3e8f0]">{tabs.map(tab => <button key={tab} onClick={() => onChange(tab)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-semibold ${active === tab ? 'border-[#1257e0] text-[#1257e0]' : 'border-transparent text-[#5b6b82] hover:text-[#0f1b2d]'}`}>{tab}</button>)}</div>
}

export function ProgressMeter({ value, tone = 'blue' }: { value: number; tone?: Tone }) {
    return <div className="flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8edf5]"><div className={`h-full rounded-full ${toneClasses[tone].bar}`} style={{ width: `${percentage(value)}%` }} /></div><span className="w-9 text-right text-[12px] font-semibold text-[#0f1b2d]">{Math.round(percentage(value))}%</span></div>
}

export function SectionSkeleton() {
    return <div className="animate-pulse space-y-4"><div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(item => <div key={item} className="h-28 rounded-[10px] bg-[#e3e8f0]" />)}</div><div className="h-80 rounded-[10px] bg-[#e3e8f0]" /></div>
}

export function useFilteredRecords(records: BusinessRecord[], query: string) {
    return useMemo(() => {
        const normalized = query.trim().toLowerCase()
        if (!normalized) return records
        return records.filter(record => JSON.stringify(record).toLowerCase().includes(normalized))
    }, [records, query])
}
