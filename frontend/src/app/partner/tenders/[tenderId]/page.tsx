'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
    ArrowLeft, ArrowRight, CalendarDays, Check, CircleAlert, CircleCheck, Clock, Download, FileText, IndianRupee,
    ListChecks, Lock, MapPin, Save, Trash2, TriangleAlert, Undo2, Upload, X,
} from 'lucide-react'
import { ApiError } from '@/lib/api'
import { Notice } from '@/features/partner/PartnerShell'
import { formatBytes, formatDate } from '@/features/partner/FieldInput'
import { fieldErrorsOf, messageOf } from '@/features/partner/api'
import { closingLabel, formatMoney, formatMoneyShort, tenderApi, type EligibilityCheck, type Tender } from '@/features/partner/tenderApi'

const inputClass =
    'block w-full rounded-lg border border-[#d5dce6] bg-white px-3 py-2 text-[14px] text-[#0f1b2d] placeholder:text-slate-400 ' +
    'focus:border-[#1257e0] focus:outline-none focus:ring-2 focus:ring-[#1257e0]/25 disabled:bg-slate-100 disabled:text-slate-600'

const CURRENCY_NAMES: Record<string, string> = { INR: 'Indian Rupees', USD: 'US Dollars', EUR: 'Euros', GBP: 'Pounds Sterling' }

const CHECK_STYLE = {
    PASSED: { icon: Check, circle: 'bg-[#12a150] text-white', word: 'Passed', text: 'text-[#0d7a3c]' },
    PENDING: { icon: Clock, circle: 'bg-[#e08a00] text-white', word: 'Pending', text: 'text-[#a86400]' },
    FAILED: { icon: X, circle: 'bg-[#e02424] text-white', word: 'Not met', text: 'text-[#c81e1e]' },
} as const

/** Tender detail with the partner's own bid: eligibility, what is being bought, and the bid form. */
export default function PartnerTenderPage() {
    const { tenderId } = useParams<{ tenderId: string }>()
    const [tender, setTender] = useState<Tender | null>(null)
    const [loadError, setLoadError] = useState<{ notFound: boolean; message: string } | null>(null)

    const fetchTender = useCallback(() => {
        tenderApi.detail(tenderId).then(setTender).catch(failure =>
            setLoadError({ notFound: failure instanceof ApiError && failure.status === 404, message: messageOf(failure) })
        )
    }, [tenderId])

    useEffect(() => { fetchTender() }, [fetchTender])

    const load = () => { setLoadError(null); fetchTender() }

    return (
        <div className="space-y-3.5">
            {loadError && (
                <>
                    <BackLink />
                    <Notice tone="error" title={loadError.notFound ? 'This tender is not available' : 'We could not load this tender'}>
                        <p>{loadError.notFound ? 'It may have been withdrawn, or the link is wrong.' : loadError.message}</p>
                        {!loadError.notFound && (
                            <button onClick={load} className="mt-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-50">Try again</button>
                        )}
                    </Notice>
                </>
            )}
            {!tender && !loadError && <div className="h-96 animate-pulse rounded-[10px] bg-[#e3e8f0]" aria-busy="true" aria-label="Loading tender" />}
            {tender && <TenderDetail tender={tender} onChange={setTender} />}
        </div>
    )
}

function BackLink() {
    return (
        <Link href="/partner/tenders" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1257e0] hover:underline">
            <ArrowLeft size={15} aria-hidden /> Back to Tenders
        </Link>
    )
}

function TenderDetail({ tender, onChange }: { tender: Tender; onChange: (tender: Tender) => void }) {
    const deadline = tender.closingDate ? new Date(tender.closingDate) : null
    const deadlineTime = deadline && !Number.isNaN(deadline.getTime())
        ? new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' }).format(deadline)
        : null
    const currency = tender.estimatedValue.currency

    return (
        <>
            <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-3 text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-[#0f1b2d] sm:text-[30px]">
                        <span>{tender.title}</span>
                        <OpenChip tender={tender} />
                    </h1>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[14px] text-[#5b6b82]">
                        {tender.project && <span>{tender.project}</span>}
                        {tender.project && <span aria-hidden className="text-[#c4ccd8]">|</span>}
                        <span>Tender No: <span className="text-[#26364d]">{tender.referenceNumber}</span></span>
                    </p>
                </div>
                <div className="shrink-0 sm:text-right">
                    <BackLink />
                    {tender.publishDate && <p className="mt-1 text-[12.5px] text-[#5b6b82]">Published: {formatDate(tender.publishDate)}</p>}
                </div>
            </header>

            <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi icon={CalendarDays} tone="blue" label="Bid Submission Deadline" value={tender.closingDate ? formatDate(tender.closingDate) : 'Not set'}
                    detail={[deadlineTime, closingLabel(tender)].filter(Boolean).join(' · ')} />
                <Kpi icon={IndianRupee} tone="blue" label="Estimated Contract Value" value={formatMoneyShort(tender.estimatedValue)} detail="Buyer's estimate" />
                <Kpi icon={FileText} tone="green" label="Currency" value={currency} detail={CURRENCY_NAMES[currency] ?? currency} />
                <Kpi icon={MapPin} tone="red" label="Project" value={tender.project ?? '—'} detail={`Tender ${tender.referenceNumber}`} />
            </section>

            {tender.outcome === 'AWARDED_TO_YOU' && (
                <Notice tone="success" title="This tender has been awarded to you">
                    <p>The buyer selected your bid. They will contact you about the next steps.</p>
                </Notice>
            )}
            {tender.outcome === 'NOT_SELECTED' && (
                <Notice tone="info" title="This tender was awarded to another bidder">
                    <p>Your bid was not selected this time. It is kept below for your records.</p>
                </Notice>
            )}

            <BidWorkspace tender={tender} onChange={onChange} />
        </>
    )
}

/** Everything below the summary cards. One component, because the bid form's state feeds the BOQ, documents, checklist and actions. */
function BidWorkspace({ tender, onChange }: { tender: Tender; onChange: (tender: Tender) => void }) {
    const bid = tender.bid
    const fileInput = useRef<HTMLInputElement>(null)
    const [amount, setAmount] = useState(bid?.amount ? String(bid.amount.amountMinor / 100) : '')
    const [validity, setValidity] = useState(bid?.validityDays ? String(bid.validityDays) : '')
    const [note, setNote] = useState(bid?.note ?? '')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
    const [busy, setBusy] = useState<string | null>(null)
    const [dirty, setDirty] = useState(false)
    const [confirming, setConfirming] = useState(false)

    const locked = !tender.canEdit
    const currency = tender.estimatedValue.currency
    const canBid = tender.open || Boolean(bid)
    const amountNumber = Number(amount.replace(/,/g, ''))

    /** The form as a draft, or the field errors that stop it from being one. */
    function draft() {
        const problems: Record<string, string> = {}
        const cleaned = amount.replace(/,/g, '').trim()
        let amountMinor: number | null = null
        if (cleaned) {
            const value = Number(cleaned)
            if (!Number.isFinite(value) || value < 0) problems.amount = 'Enter the bid value as a number.'
            else amountMinor = Math.round(value * 100)
        }
        let validityDays: number | null = null
        if (validity.trim()) {
            validityDays = Number(validity)
            if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365) problems.validityDays = 'Validity is between 1 and 365 days.'
        }
        return { problems, value: { amount: amountMinor === null ? null : { amountMinor, currency }, validityDays, note: note.trim() || null } }
    }

    async function run(name: string, action: () => Promise<Tender>, success?: string): Promise<boolean> {
        setBusy(name)
        setMessage(null)
        try {
            onChange(await action())
            setErrors({})
            if (success) setMessage({ tone: 'success', text: success })
            return true
        } catch (failure) {
            const fieldErrors = fieldErrorsOf(failure)
            setErrors(fieldErrors)
            setMessage({ tone: 'error', text: fieldErrors.quotation ?? messageOf(failure) })
            return false
        } finally {
            setBusy(null)
            if (fileInput.current) fileInput.current.value = ''
        }
    }

    async function save(): Promise<boolean> {
        const { problems, value } = draft()
        setErrors(problems)
        if (Object.keys(problems).length) {
            setMessage({ tone: 'error', text: 'Some entries need attention. Nothing was saved.' })
            return false
        }
        const saved = await run('save', () => tenderApi.saveBid(tender.id, value), 'Bid draft saved.')
        if (saved) setDirty(false)
        return saved
    }

    async function submit() {
        // Whatever is on screen is what gets submitted: save it first if it was changed.
        if (dirty && !(await save())) return
        setConfirming(false)
        await run('submit', () => tenderApi.submit(tender.id), 'Your bid has been submitted.')
    }

    function chooseFile(file: File | undefined) {
        if (!file) return
        if (file.size > tender.maxDocumentBytes) {
            setMessage({ tone: 'error', text: `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(tender.maxDocumentBytes)}.` })
            return
        }
        run('upload', () => tenderApi.uploadQuotation(tender.id, file))
    }

    const mark = (setter: (value: string) => void) => (value: string) => { setter(value); setDirty(true); setConfirming(false) }
    // While there are unsaved edits the server's list may be out of date for the amount; the rest still holds.
    const blockers = tender.blockers.filter(blocker => !(dirty && amount.trim() && blocker.startsWith('Enter your bid value')))

    const readiness: Array<{ label: string; state: 'done' | 'progress' | 'pending' }> = [
        ...tender.checks.map(check => ({ label: check.label, state: check.state === 'PASSED' ? 'done' as const : check.state === 'PENDING' ? 'progress' as const : 'pending' as const })),
        { label: 'Bid value entered', state: amountNumber > 0 ? (dirty ? 'progress' : 'done') : 'pending' },
        { label: 'Quotation document uploaded', state: bid?.quotation ? 'done' : 'pending' },
        { label: 'Bid submitted', state: bid?.status === 'SUBMITTED' ? 'done' : bid ? 'progress' : 'pending' },
    ]

    return (
        <section className="grid items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-w-0 space-y-3.5">
                <Card title="Vendor Eligibility & Compliance Status">
                    <EligibilityTrack checks={tender.checks} eligible={tender.eligible} />
                    {tender.checks.some(check => check.label.startsWith('Qualification') && check.state !== 'PASSED') && (
                        <div className="border-t border-[#edf1f6] px-4 py-3">
                            <Link href="/partner/qualification" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1257e0] hover:underline">
                                Go to your qualification <ArrowRight size={14} aria-hidden />
                            </Link>
                        </div>
                    )}
                </Card>

                <Card
                    title="Bill of Quantities (BOQ) - Bid Submission"
                    action={<span className="text-[12px] text-[#5b6b82]">All amounts in {currency} (excluding GST)</span>}
                >
                    {tender.description && <p className="whitespace-pre-line px-4 pb-3 text-[13px] text-[#26364d]">{tender.description}</p>}
                    {tender.lines.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="vc-table min-w-[480px]">
                                <thead>
                                    <tr>
                                        <th className="w-10 pl-4">#</th>
                                        <th>Description</th>
                                        <th>Unit</th>
                                        <th className="pr-4 text-right">Estimated Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tender.lines.map((line, index) => (
                                        <tr key={index}>
                                            <td className="pl-4 text-[#5b6b82]">{index + 1}</td>
                                            <td className="text-[#0f1b2d]">{line.description}</td>
                                            <td className="text-[#26364d]">{line.unit}</td>
                                            <td className="pr-4 text-right tabular-nums text-[#0f1b2d]">{new Intl.NumberFormat('en-IN').format(line.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="px-4 pb-3 text-[13px] text-[#5b6b82]">The buyer has not published line items for this tender.</p>
                    )}

                    {canBid && (
                        <div className="border-t border-[#d5e2fb] bg-[#f3f7ff] px-4 py-3.5">
                            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                                <div>
                                    <label htmlFor="bid-amount" className="text-[15px] font-bold text-[#0f1b2d]">
                                        <span className="text-[#1257e0] underline underline-offset-2">Total Bid Amount</span> (Excluding GST) <span className="text-red-600" aria-hidden>*</span>
                                    </label>
                                    <p id="bid-amount-hint" className="mt-0.5 text-[12.5px] text-[#5b6b82]">
                                        Your total price for the full scope above, in {currency}.
                                        {amountNumber > 0 && <> That is <strong className="text-[#0f1b2d]">{formatMoney({ amountMinor: Math.round(amountNumber * 100), currency })}</strong>.</>}
                                    </p>
                                </div>
                                <div>
                                    <input
                                        id="bid-amount"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        disabled={locked}
                                        value={amount}
                                        onChange={event => mark(setAmount)(event.target.value)}
                                        aria-invalid={errors.amount ? true : undefined}
                                        aria-describedby="bid-amount-hint"
                                        placeholder="12450000"
                                        className={`${inputClass} text-right text-[16px] font-bold tabular-nums`}
                                    />
                                    {errors.amount && <p role="alert" className="mt-1 text-[12.5px] font-medium text-red-700">{errors.amount}</p>}
                                </div>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
                                <div>
                                    <label htmlFor="bid-validity" className="mb-1 block text-[13px] font-semibold text-[#0f1b2d]">
                                        Offer valid for (days) <span className="font-normal text-[#5b6b82]">(optional)</span>
                                    </label>
                                    <input id="bid-validity" inputMode="numeric" disabled={locked} value={validity}
                                        onChange={event => mark(setValidity)(event.target.value)}
                                        aria-invalid={errors.validityDays ? true : undefined} placeholder="90" className={inputClass} />
                                    {errors.validityDays && <p role="alert" className="mt-1 text-[12.5px] font-medium text-red-700">{errors.validityDays}</p>}
                                </div>
                                <div>
                                    <label htmlFor="bid-note" className="mb-1 block text-[13px] font-semibold text-[#0f1b2d]">
                                        Note to the buyer <span className="font-normal text-[#5b6b82]">(optional)</span>
                                    </label>
                                    <textarea id="bid-note" rows={1} maxLength={1000} disabled={locked} value={note}
                                        onChange={event => mark(setNote)(event.target.value)} className={inputClass} />
                                    {errors.note && <p role="alert" className="mt-1 text-[12.5px] font-medium text-red-700">{errors.note}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                <div className="grid items-start gap-3.5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                    <Card
                        icon={FileText}
                        title="Supporting Documents"
                        action={<span className="text-[12px] text-[#5b6b82]">PDF, JPG or PNG (max {formatBytes(tender.maxDocumentBytes)})</span>}
                    >
                        <div className="overflow-x-auto">
                            <table className="vc-table min-w-[520px]">
                                <thead>
                                    <tr>
                                        <th className="pl-4">Document Name</th>
                                        <th>File Name</th>
                                        <th>Uploaded On</th>
                                        <th>Status</th>
                                        <th className="pr-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="pl-4 font-medium text-[#0f1b2d]">Bid Quotation <span className="text-red-600" aria-hidden>*</span></td>
                                        <td className="max-w-40 truncate">
                                            {bid?.quotation
                                                ? <a href={tenderApi.quotationUrl(tender.id)} className="text-[#1257e0] hover:underline">{bid.quotation.fileName}</a>
                                                : <span className="text-[#5b6b82]">—</span>}
                                        </td>
                                        <td className="whitespace-nowrap text-[#26364d]">{bid?.quotation ? formatDate(bid.quotation.uploadedAt) : '—'}</td>
                                        <td>{bid?.quotation ? <Pill tone="green" icon={CircleCheck}>Uploaded</Pill> : <Pill tone="red" icon={CircleAlert}>Not Uploaded</Pill>}</td>
                                        <td className="pr-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {bid?.quotation && (
                                                    <a href={tenderApi.quotationUrl(tender.id)} aria-label="Download quotation" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1257e0] hover:bg-[#e8f0ff]">
                                                        <Download size={16} aria-hidden />
                                                    </a>
                                                )}
                                                {!locked && bid?.quotation && (
                                                    <button type="button" disabled={busy !== null} onClick={() => run('remove', () => tenderApi.removeQuotation(tender.id))}
                                                        aria-label="Remove quotation" className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-60">
                                                        <Trash2 size={16} aria-hidden />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {!locked && canBid && (
                            <div className="border-t border-[#edf1f6] p-3">
                                <label htmlFor="bid-quotation" className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 text-[13px] font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-[#1257e0] ${busy === 'upload' ? 'border-slate-300 bg-slate-100 text-slate-500' : 'border-[#1257e0]/60 bg-white text-[#1257e0] hover:bg-[#e8f0ff]'}`}>
                                    <Upload size={16} aria-hidden /> {busy === 'upload' ? 'Uploading…' : bid?.quotation ? 'Replace quotation' : 'Upload quotation'}
                                    <input ref={fileInput} id="bid-quotation" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                        disabled={busy !== null} onChange={event => chooseFile(event.target.files?.[0])} className="sr-only" />
                                </label>
                            </div>
                        )}
                    </Card>

                    <Card icon={ListChecks} title="Bid Readiness Checklist">
                        <table className="vc-table">
                            <thead>
                                <tr>
                                    <th className="w-10 pl-4">#</th>
                                    <th>Checklist Item</th>
                                    <th className="pr-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readiness.map((item, index) => (
                                    <tr key={item.label}>
                                        <td className="pl-4 text-[#5b6b82]">{index + 1}</td>
                                        <td className="text-[#26364d]">{item.label}</td>
                                        <td className="pr-4">
                                            {item.state === 'done' && <Pill tone="green" icon={CircleCheck}>Completed</Pill>}
                                            {item.state === 'progress' && <Pill tone="amber" icon={Clock}>In Progress</Pill>}
                                            {item.state === 'pending' && <Pill tone="red" icon={CircleAlert}>Pending</Pill>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>

            <aside className="space-y-3.5">
                <Card title="Tender Details">
                    <dl className="space-y-2 px-4 pb-4 text-[13px]">
                        <Row label="Tender No">{tender.referenceNumber}</Row>
                        <Row label="Project">{tender.project ?? '—'}</Row>
                        <Row label="Published">{tender.publishDate ? formatDate(tender.publishDate) : '—'}</Row>
                        <Row label="Bids Close">{tender.closingDate ? formatDate(tender.closingDate) : 'Not set'}</Row>
                        <Row label="Time Left"><span className={tender.open ? 'text-[#0d7a3c]' : 'text-[#5b6b82]'}>{closingLabel(tender)}</span></Row>
                        <Row label="BOQ Items">{tender.lines.length}</Row>
                        {bid && <Row label="Your Bid">{bid.status === 'SUBMITTED' ? `Submitted${bid.submittedAt ? ` ${formatDate(bid.submittedAt)}` : ''}` : `Draft, saved ${formatDate(bid.lastSavedAt)}`}</Row>}
                    </dl>
                </Card>

                <Card title="Next Actions & Submission">
                    <div className="space-y-3 px-4 pb-4">
                        {!canBid && <p className="text-[13px] text-[#26364d]">This tender closed before you made a bid.</p>}

                        {locked && bid && (
                            <p className="flex items-start gap-2 rounded-lg border border-[#e3e8f0] bg-[#f7f9fc] px-3 py-2.5 text-[13px] text-[#26364d]">
                                <Lock size={15} className="mt-0.5 shrink-0" aria-hidden />
                                {tender.open ? 'Your bid is submitted and fixed. Withdraw it if you need to change it.' : 'This tender is closed. Your bid is shown as submitted.'}
                            </p>
                        )}

                        {!locked && blockers.length > 0 && (
                            <div role="status" className="flex items-start gap-3 rounded-lg border border-[#f8c9c9] bg-[#fdeeee] px-3 py-3">
                                <TriangleAlert size={20} className="mt-0.5 shrink-0 text-[#e02424]" aria-hidden />
                                <div>
                                    <p className="text-[13.5px] font-semibold text-[#c81e1e]">Not eligible to submit yet</p>
                                    <ul className="mt-1 space-y-0.5 text-[12.5px] text-[#26364d]">
                                        {blockers.map(blocker => <li key={blocker}>{blocker}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {!locked && canBid && blockers.length === 0 && (
                            <p className="flex items-start gap-2 rounded-lg border border-[#c6ead4] bg-[#f0faf4] px-3 py-2.5 text-[13px] text-[#0d7a3c]">
                                <CircleCheck size={16} className="mt-0.5 shrink-0" aria-hidden /> Everything needed is in place. You can submit your bid.
                            </p>
                        )}

                        {message && <Notice tone={message.tone} title={message.text} />}

                        {!locked && canBid && !confirming && (
                            <>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <button type="button" disabled={busy !== null} onClick={save}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#1257e0] bg-white px-3 text-sm font-semibold text-[#1257e0] hover:bg-[#e8f0ff] disabled:opacity-60">
                                        <Save size={16} aria-hidden /> {busy === 'save' ? 'Saving…' : 'Save Draft'}
                                    </button>
                                    <button type="button" disabled={busy !== null || blockers.length > 0} onClick={() => setConfirming(true)}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1257e0] px-3 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 hover:bg-[#0f4bc4] disabled:cursor-not-allowed disabled:bg-[#e3e8f0] disabled:text-[#8a97ab] disabled:shadow-none">
                                        Submit Bid <ArrowRight size={16} aria-hidden />
                                    </button>
                                </div>
                                {blockers.length > 0 && <p className="text-right text-[12px] text-[#5b6b82]">Submit is enabled once the items above are cleared</p>}
                                {dirty && <p className="text-[12px] text-[#a86400]">You have unsaved changes.</p>}
                            </>
                        )}

                        {!locked && confirming && (
                            <div role="group" aria-label="Confirm bid submission" className="rounded-lg border border-[#1257e0]/40 bg-[#e8f0ff] p-3">
                                <p className="text-sm font-semibold text-[#0f1b2d]">
                                    Submit a bid of {formatMoney({ amountMinor: Math.round(amountNumber * 100), currency })} on {tender.title}?
                                </p>
                                <p className="text-[13px] text-[#26364d]">The buyer sees bids only after the tender closes. You can withdraw and change it until then.</p>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <button type="button" disabled={busy !== null} onClick={submit}
                                        className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1257e0] px-4 text-sm font-semibold text-white hover:bg-[#0f4bc4] disabled:opacity-60">
                                        {busy === 'submit' || busy === 'save' ? 'Submitting…' : 'Yes, submit bid'}
                                    </button>
                                    <button type="button" disabled={busy !== null} onClick={() => setConfirming(false)}
                                        className="inline-flex min-h-10 items-center rounded-lg border border-[#d5dce6] bg-white px-4 text-sm font-semibold text-[#26364d] hover:bg-slate-50">
                                        Not yet
                                    </button>
                                </div>
                            </div>
                        )}

                        {tender.canWithdraw && (
                            <button type="button" disabled={busy !== null} onClick={() => run('withdraw', () => tenderApi.withdraw(tender.id), 'Bid withdrawn. It is a draft again; submit it when you are ready.')}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#d5dce6] bg-white px-4 text-sm font-semibold text-[#26364d] hover:bg-slate-50 disabled:opacity-60">
                                <Undo2 size={16} aria-hidden /> {busy === 'withdraw' ? 'Withdrawing…' : 'Withdraw to make changes'}
                            </button>
                        )}
                    </div>
                </Card>
            </aside>
        </section>
    )
}

/** The checks as a left-to-right track ending in the overall verdict, as on the tender screen. */
function EligibilityTrack({ checks, eligible }: { checks: EligibilityCheck[]; eligible: boolean }) {
    const nodes = [
        ...checks.map(check => ({ key: check.label, label: check.label, state: check.state, word: CHECK_STYLE[check.state].word, detail: check.detail })),
        {
            key: '__verdict',
            label: 'Eligibility Status',
            state: eligible ? 'PASSED' as const : 'FAILED' as const,
            word: eligible ? 'Eligible' : 'Not Eligible',
            detail: eligible ? 'You may submit a bid' : 'Complete pending items to submit a bid',
        },
    ]
    return (
        <ol className="flex overflow-x-auto px-2 pb-4 pt-1">
            {nodes.map((node, index) => {
                const style = CHECK_STYLE[node.state]
                const Icon = style.icon
                return (
                    <li key={node.key} className="relative flex min-w-[140px] flex-1 flex-col items-center px-2 text-center">
                        {index > 0 && (
                            <span aria-hidden className="absolute top-[15px] h-0.5 bg-[#d5dce6]" style={{ left: 'calc(-50% + 20px)', right: 'calc(50% + 20px)' }} />
                        )}
                        <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${style.circle}`}>
                            <Icon size={17} strokeWidth={3} aria-hidden />
                        </span>
                        <span className="mt-2 text-[13.5px] font-semibold text-[#0f1b2d]">{node.label}</span>
                        <span className={`text-[16px] font-bold ${style.text}`}>{node.word}</span>
                        <span className="mt-0.5 max-w-[180px] text-[12px] leading-snug text-[#5b6b82]">{node.detail}</span>
                    </li>
                )
            })}
        </ol>
    )
}

function Card({ title, icon: Icon, action, children }: { title: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode }) {
    return (
        <section className="overflow-hidden rounded-[10px] border border-[#e3e8f0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2.5 pt-3.5">
                <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-[#0f1b2d]">
                    {Icon && <Icon size={19} className="text-[#1257e0]" aria-hidden />}
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </section>
    )
}

const KPI_TONES = {
    blue: 'bg-[#e8f0ff] text-[#1257e0]',
    green: 'bg-[#e4f6ec] text-[#12a150]',
    red: 'bg-[#fde8e8] text-[#e02424]',
}

function Kpi({ icon: Icon, tone, label, value, detail }: { icon: LucideIcon; tone: keyof typeof KPI_TONES; label: string; value: string; detail: string }) {
    return (
        <article className="rounded-[10px] border border-[#e3e8f0] bg-white px-5 py-4">
            <div className="flex items-start gap-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${KPI_TONES[tone]}`}>
                    <Icon size={24} strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#26364d]">{label}</p>
                    <p className="mt-0.5 truncate text-[24px] font-extrabold leading-tight text-[#0f1b2d]">{value}</p>
                    {detail && <p className="mt-1 truncate text-[12.5px] text-[#5b6b82]">{detail}</p>}
                </div>
            </div>
        </article>
    )
}

const PILL_TONES = {
    green: 'bg-[#e4f6ec] text-[#0d7a3c]',
    amber: 'bg-[#fff3dc] text-[#a86400]',
    red: 'bg-[#fde8e8] text-[#c81e1e]',
}

function Pill({ tone, icon: Icon, children }: { tone: keyof typeof PILL_TONES; icon: LucideIcon; children: ReactNode }) {
    return (
        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${PILL_TONES[tone]}`}>
            <Icon size={12} aria-hidden /> {children}
        </span>
    )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <dt className="text-[#5b6b82]">{label}</dt>
            <dd className="font-medium text-[#0f1b2d]">{children}</dd>
        </div>
    )
}

function OpenChip({ tender }: { tender: Tender }) {
    if (!tender.open) return <span className="rounded-md bg-[#eef1f5] px-2.5 py-1 text-[12px] font-semibold text-[#4a5a70]">Closed</span>
    return <span className="rounded-md bg-[#e8f0ff] px-2.5 py-1 text-[12px] font-semibold text-[#1257e0]">Open for Bidding</span>
}
