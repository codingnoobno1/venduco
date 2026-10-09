// Buyer-side bid comparison and award
"use client"

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Award, CalendarClock, CircleCheck, Download, Gavel, Lock, Scale, TriangleAlert } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { MetricGrid, Panel, WorkspaceHeader } from '@/components/dashboard/redesign/RedesignKit'
import {
    evaluationApi, formatDate, formatMoney, formatMoneyShort, formatPercent, STAGE_LABEL,
    type Evaluation, type RankedBid, type Stage,
} from '@/features/tender/evaluationApi'

const STAGE_STYLE: Record<Stage, string> = {
    EVALUATION: 'bg-amber-50 text-amber-800',
    OPEN: 'bg-slate-100 text-slate-700',
    AWARDED: 'bg-emerald-50 text-emerald-800',
    CLOSED: 'bg-slate-100 text-slate-700',
}

function messageOf(error: unknown): string {
    return error instanceof ApiError ? error.message : 'Something went wrong. Check your connection and try again.'
}

export default function BidsPage() {
    // useSearchParams needs a Suspense boundary above it.
    return <Suspense fallback={null}><BidsWorkspace /></Suspense>
}

function BidsWorkspace() {
    const router = useRouter()
    const selectedId = useSearchParams().get('tender')
    const [tenders, setTenders] = useState<Evaluation[] | null>(null)
    const [listError, setListError] = useState<string | null>(null)

    const fetchList = useCallback(() => {
        evaluationApi.list().then(setTenders).catch(failure => setListError(messageOf(failure)))
    }, [])

    useEffect(() => { fetchList() }, [fetchList])

    const select = (tenderId: string) => router.replace(`/dashboard/pm/bids?tender=${tenderId}`, { scroll: false })
    // With nothing chosen, open the first tender that is waiting for a decision.
    const activeId = selectedId ?? tenders?.find(tender => tender.stage === 'EVALUATION')?.tenderId ?? tenders?.[0]?.tenderId ?? null
    const count = (stage: Stage) => tenders?.filter(tender => tender.stage === stage).length ?? 0

    return (
        <div className="space-y-5">
            <WorkspaceHeader
                eyebrow="BIDS & PROCUREMENT"
                title="Bid comparison and award"
                subtitle="Bids stay sealed until a tender closes. After that, compare them against each other and your estimate, then award."
            />

            {listError && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                    <strong>Tenders could not be loaded.</strong> {listError}{' '}
                    <button onClick={() => { setListError(null); fetchList() }} className="font-semibold underline">Try again</button>
                </div>
            )}

            {tenders && (
                <MetricGrid
                    items={[
                        { label: 'Ready to evaluate', value: count('EVALUATION'), detail: 'Closed and waiting for an award', icon: Scale, tone: count('EVALUATION') > 0 ? 'amber' : 'slate' },
                        { label: 'Open, bids sealed', value: count('OPEN'), detail: 'Still accepting bids', icon: Lock, tone: 'blue' },
                        { label: 'Awarded', value: count('AWARDED'), detail: 'Decision recorded', icon: Award, tone: 'green' },
                        { label: 'All tenders', value: tenders.length, detail: 'Published or later', icon: Gavel, tone: 'slate' },
                    ]}
                />
            )}

            <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                <Panel title="Tenders" subtitle={tenders ? `${tenders.length} in total` : undefined}>
                    {!tenders && !listError && <div className="m-4 h-40 animate-pulse rounded-lg bg-slate-100" aria-busy="true" aria-label="Loading tenders" />}
                    {tenders?.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-600">No tenders have been published yet.</p>}
                    <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
                        {tenders?.map(tender => {
                            const active = tender.tenderId === activeId
                            return (
                                <li key={tender.tenderId}>
                                    <button
                                        onClick={() => select(tender.tenderId)}
                                        aria-current={active ? 'true' : undefined}
                                        className={`block w-full px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className="block text-[13px] font-semibold text-slate-950">{tender.title}</span>
                                        <span className="block truncate text-xs text-slate-600">{tender.referenceNumber}</span>
                                        <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                            <span className={`rounded-md px-2 py-0.5 font-semibold ${STAGE_STYLE[tender.stage]}`}>{STAGE_LABEL[tender.stage]}</span>
                                            {tender.bidCount !== undefined && <span className="text-slate-700">{tender.bidCount} bid{tender.bidCount === 1 ? '' : 's'}</span>}
                                            <span className="text-slate-600">closes {formatDate(tender.closingDate)}</span>
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </Panel>

                {activeId
                    ? <EvaluationPanel key={activeId} tenderId={activeId} onAwarded={fetchList} />
                    : tenders && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">Choose a tender to see its bids.</div>}
            </div>
        </div>
    )
}

function EvaluationPanel({ tenderId, onAwarded }: { tenderId: string; onAwarded: () => void }) {
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [chosenBidId, setChosenBidId] = useState<string | null>(null)

    const fetchEvaluation = useCallback(() => {
        evaluationApi.detail(tenderId).then(setEvaluation).catch(failure => setError(messageOf(failure)))
    }, [tenderId])

    useEffect(() => { fetchEvaluation() }, [fetchEvaluation])

    if (error) {
        return (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                <strong>This tender could not be loaded.</strong> {error}{' '}
                <button onClick={() => { setError(null); fetchEvaluation() }} className="font-semibold underline">Try again</button>
            </div>
        )
    }
    if (!evaluation) return <div className="h-96 animate-pulse rounded-xl bg-slate-200" aria-busy="true" aria-label="Loading bids" />

    const bids = evaluation.bids ?? []
    const chosen = bids.find(bid => bid.bidId === chosenBidId) ?? null

    return (
        <div className="min-w-0 space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold tracking-tight text-slate-950">{evaluation.title}</h2>
                        <p className="text-sm text-slate-600">{evaluation.project ?? 'Project'} · {evaluation.referenceNumber}</p>
                    </div>
                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${STAGE_STYLE[evaluation.stage]}`}>{STAGE_LABEL[evaluation.stage]}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                    <Fact label="Your estimate" value={formatMoneyShort(evaluation.estimatedValue)} />
                    <Fact label="Bids closed" value={formatDate(evaluation.closingDate)} />
                    <Fact label="Bids received" value={evaluation.sealed ? 'Sealed' : String(bids.length)} />
                    <Fact label="Lowest bid" value={bids[0] ? formatMoneyShort(bids[0].amount) : '—'} />
                </dl>
            </section>

            {evaluation.sealed && (
                <section className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <Lock size={22} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
                    <div>
                        <h3 className="text-[15px] font-bold text-slate-950">Bids are sealed</h3>
                        <p className="text-sm text-slate-700">
                            This tender accepts bids until the end of {formatDate(evaluation.closingDate)}. Until then nobody on the buyer side
                            can see the bids, or how many there are. They open here the day after.
                        </p>
                    </div>
                </section>
            )}

            {evaluation.award && (
                <section className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <CircleCheck size={22} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden />
                    <div className="text-sm text-emerald-950">
                        <h3 className="text-[15px] font-bold">Awarded to {evaluation.award.bidder ?? 'the selected bidder'}</h3>
                        <p>By {evaluation.award.awardedBy} on {formatDate(evaluation.award.awardedAt)}.</p>
                        <p className="mt-1"><span className="font-semibold">Reason:</span> {evaluation.award.reason}</p>
                    </div>
                </section>
            )}
            {evaluation.stage === 'AWARDED' && !evaluation.award && (
                <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    This tender is marked as awarded, but the award was not recorded here, so there are no details to show.
                </p>
            )}

            {!evaluation.sealed && (
                <Panel title="Bid comparison" subtitle={bids.length ? 'Lowest price first. Percentages compare each bid with your estimate and with the lowest bid.' : undefined}>
                    {bids.length === 0 ? (
                        <p className="px-4 py-10 text-center text-sm text-slate-600">No bids were submitted for this tender.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
                                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-semibold">Rank</th>
                                        <th scope="col" className="px-4 py-3 font-semibold">Bidder</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">Bid value</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">vs estimate</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">vs lowest</th>
                                        <th scope="col" className="px-4 py-3 font-semibold">Offer valid until</th>
                                        <th scope="col" className="px-4 py-3 font-semibold">Quotation</th>
                                        <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">Award</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bids.map(bid => <BidRow key={bid.bidId} bid={bid} evaluation={evaluation} chosen={bid.bidId === chosenBidId} onChoose={() => setChosenBidId(bid.bidId)} />)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            )}

            {!evaluation.sealed && bids.length > 0 && !evaluation.canAward && evaluation.stage !== 'AWARDED' && evaluation.awardBlockedReason && (
                <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{evaluation.awardBlockedReason}</p>
            )}

            {chosen && evaluation.canAward && (
                <AwardForm
                    evaluation={evaluation}
                    bid={chosen}
                    onCancel={() => setChosenBidId(null)}
                    onAwarded={updated => { setEvaluation(updated); setChosenBidId(null); onAwarded() }}
                />
            )}
        </div>
    )
}

function BidRow({ bid, evaluation, chosen, onChoose }: { bid: RankedBid; evaluation: Evaluation; chosen: boolean; onChoose: () => void }) {
    const overEstimate = (bid.versusEstimatePct ?? 0) > 0
    return (
        <tr className={bid.awarded ? 'bg-emerald-50/60' : chosen ? 'bg-blue-50/60' : undefined}>
            <td className="px-4 py-3 align-top">
                <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold ${bid.rank === 1 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
                    L{bid.rank}
                </span>
            </td>
            <td className="px-4 py-3 align-top">
                <span className="block font-semibold text-slate-950">{bid.bidder}</span>
                <span className="block text-xs text-slate-600">
                    {bid.bidderKind === 'COMPANY' ? 'Company' : 'Individual'} · submitted {formatDate(bid.submittedAt)}
                </span>
                {bid.qualification !== 'APPROVED' && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
                        <TriangleAlert size={12} aria-hidden /> Qualification no longer approved
                    </span>
                )}
                {bid.note && <span className="mt-1 block max-w-xs text-xs text-slate-700">“{bid.note}”</span>}
            </td>
            <td className="px-4 py-3 text-right align-top font-semibold tabular-nums text-slate-950">{formatMoney(bid.amount)}</td>
            <td className={`px-4 py-3 text-right align-top tabular-nums ${overEstimate ? 'text-red-700' : 'text-emerald-800'}`}>
                {formatPercent(bid.versusEstimatePct)}
                <span className="sr-only">{overEstimate ? ' above estimate' : ' below or at estimate'}</span>
            </td>
            <td className="px-4 py-3 text-right align-top tabular-nums text-slate-800">{bid.rank === 1 ? 'Lowest' : formatPercent(bid.versusLowestPct)}</td>
            <td className="px-4 py-3 align-top text-slate-800">
                {bid.offerValidUntil ? (
                    <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} className="text-slate-500" aria-hidden /> {formatDate(bid.offerValidUntil)}</span>
                ) : 'Not stated'}
            </td>
            <td className="px-4 py-3 align-top">
                {bid.quotationFileName ? (
                    <a href={evaluationApi.quotationUrl(evaluation.tenderId, bid.bidId)} className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:underline">
                        <Download size={14} aria-hidden /> <span className="max-w-[140px] truncate">{bid.quotationFileName}</span>
                    </a>
                ) : <span className="text-slate-600">None</span>}
            </td>
            <td className="px-4 py-3 text-right align-top">
                {bid.awarded && <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-900"><Award size={13} aria-hidden /> Awarded</span>}
                {!bid.awarded && evaluation.canAward && (
                    <button onClick={onChoose} aria-pressed={chosen}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${chosen ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}>
                        {chosen ? 'Selected' : 'Select to award'}
                    </button>
                )}
            </td>
        </tr>
    )
}

function AwardForm({ evaluation, bid, onCancel, onAwarded }: {
    evaluation: Evaluation
    bid: RankedBid
    onCancel: () => void
    onAwarded: (evaluation: Evaluation) => void
}) {
    const [reason, setReason] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const notLowest = bid.rank > 1
    const reasonOk = reason.trim().length >= 10

    async function submit(event: React.FormEvent) {
        event.preventDefault()
        setSaving(true)
        setError(null)
        try {
            onAwarded(await evaluationApi.award(evaluation.tenderId, bid.bidId, reason.trim()))
        } catch (failure) {
            setError(messageOf(failure))
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-blue-200 bg-white p-4 shadow-sm" aria-labelledby="award-heading">
            <h3 id="award-heading" className="text-[15px] font-bold text-slate-950">Award to {bid.bidder}</h3>
            <p className="text-sm text-slate-700">
                {formatMoney(bid.amount)} · {formatPercent(bid.versusEstimatePct)} against your estimate of {formatMoney(evaluation.estimatedValue)}.
            </p>

            {notLowest && (
                <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
                    This is not the lowest bid: it is {formatPercent(bid.versusLowestPct)} above it. Say why it is being chosen; the reason is kept with the award.
                </p>
            )}

            <div>
                <label htmlFor="award-reason" className="mb-1 block text-sm font-semibold text-slate-800">
                    Reason for the award <span className="text-red-600" aria-hidden>*</span>
                </label>
                <textarea
                    id="award-reason"
                    rows={3}
                    maxLength={1000}
                    required
                    value={reason}
                    onChange={event => setReason(event.target.value)}
                    aria-describedby="award-reason-hint"
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                />
                <p id="award-reason-hint" className="mt-1 text-xs text-slate-600">At least 10 characters. It is recorded in the audit log.</p>
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-800">
                <input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-600" />
                I understand this cannot be undone here: the tender is closed as awarded, every bidder is told the outcome, and the winner becomes the package&apos;s contractor.
            </label>

            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}

            <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={saving || !reasonOk || !confirmed}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
                    <Award size={16} aria-hidden /> {saving ? 'Awarding…' : 'Award tender'}
                </button>
                <button type="button" disabled={saving} onClick={onCancel}
                    className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    Cancel
                </button>
            </div>
        </form>
    )
}

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-slate-600">{label}</dt>
            <dd className="font-semibold text-slate-950">{value}</dd>
        </div>
    )
}
