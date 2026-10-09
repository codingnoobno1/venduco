'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, ChevronRight } from 'lucide-react'
import { Notice } from '@/features/partner/PartnerShell'
import { formatDate } from '@/features/partner/FieldInput'
import { messageOf } from '@/features/partner/api'
import { closingLabel, formatMoneyShort, tenderApi, type Tender } from '@/features/partner/tenderApi'

/** Tenders the partner can bid on, and those they already have a bid on. */
export default function PartnerTendersPage() {
    const [tenders, setTenders] = useState<Tender[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchTenders = useCallback(() => {
        tenderApi.list().then(setTenders).catch(failure => setError(messageOf(failure)))
    }, [])

    useEffect(() => { fetchTenders() }, [fetchTenders])

    const load = () => { setError(null); fetchTenders() }

    const open = tenders?.filter(tender => tender.open) ?? []
    const closed = tenders?.filter(tender => !tender.open) ?? []

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">Tenders</h1>
                <p className="text-sm text-slate-600">Open tenders you can bid on, and the bids you have made.</p>
            </header>

            {error && (
                <Notice tone="error" title="We could not load tenders">
                    <p>{error}</p>
                    <button onClick={load} className="mt-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-50">Try again</button>
                </Notice>
            )}

            {!tenders && !error && (
                <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading tenders">
                    <div className="h-28 rounded-xl bg-slate-200" />
                    <div className="h-28 rounded-xl bg-slate-200" />
                </div>
            )}

            {tenders && tenders.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                    <p className="font-semibold text-slate-900">No tenders are open right now</p>
                    <p className="mt-1 text-sm text-slate-600">New tenders appear here as soon as a buyer publishes them.</p>
                </div>
            )}

            {open.length > 0 && <TenderList title="Open for bids" tenders={open} />}
            {closed.length > 0 && <TenderList title="Closed, with your bid" tenders={closed} />}
        </div>
    )
}

function TenderList({ title, tenders }: { title: string; tenders: Tender[] }) {
    return (
        <section aria-label={title}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">{title}</h2>
            <ul className="space-y-3">
                {tenders.map(tender => (
                    <li key={tender.id}>
                        <Link href={`/partner/tenders/${tender.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1257e0]">
                            <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[15px] font-bold text-slate-950">{tender.title}</p>
                                    <p className="truncate text-sm text-slate-600">{tender.project ?? 'Project'} · {tender.referenceNumber}</p>
                                </div>
                                <ChevronRight size={18} className="mt-1 shrink-0 text-slate-400" aria-hidden />
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                <span className="font-semibold text-slate-900">{formatMoneyShort(tender.estimatedValue)}</span>
                                {tender.closingDate && (
                                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                                        <CalendarClock size={15} aria-hidden /> {formatDate(tender.closingDate)}
                                    </span>
                                )}
                                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                                    !tender.open ? 'bg-slate-100 text-slate-700' : (tender.daysLeft ?? 99) <= 2 ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-800'
                                }`}>{closingLabel(tender)}</span>
                                <BidChip tender={tender} />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function BidChip({ tender }: { tender: Tender }) {
    if (tender.outcome === 'AWARDED_TO_YOU') return <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">Awarded to you</span>
    if (tender.outcome === 'NOT_SELECTED') return <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">Not selected</span>
    if (tender.bid?.status === 'SUBMITTED') return <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-900">Bid submitted</span>
    if (tender.bid) return <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">Bid in draft</span>
    if (tender.open && !tender.eligible) return <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">Not yet eligible</span>
    return null
}
