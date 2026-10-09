/**
 * Buyer-side bid comparison and award. Shapes mirror TenderEvaluationController on the backend.
 * The API omits fields that have no value, so optional ones may be undefined.
 */
import apiRequest from '@/lib/api'

export interface Money {
    amountMinor: number
    currency: string
}

export type Stage = 'OPEN' | 'EVALUATION' | 'AWARDED' | 'CLOSED'

export interface RankedBid {
    bidId: string
    /** 1 is the lowest price; equal amounts share a rank. */
    rank: number
    bidder: string
    bidderKind: 'COMPANY' | 'INDIVIDUAL'
    amount: Money
    versusEstimatePct?: number
    versusLowestPct: number
    validityDays?: number
    offerValidUntil?: string
    note?: string
    quotationFileName?: string
    submittedAt?: string
    qualification?: string
    awarded: boolean
}

export interface Award {
    bidId: string
    bidder?: string
    reason: string
    awardedBy: string
    awardedAt: string
}

export interface Evaluation {
    tenderId: string
    title: string
    referenceNumber: string
    project?: string
    status: string
    stage: Stage
    closingDate?: string
    estimatedValue: Money
    /** While sealed, neither the bids nor their number are sent. */
    sealed: boolean
    bidCount?: number
    bids?: RankedBid[]
    award?: Award
    canAward: boolean
    awardBlockedReason?: string
}

const BASE = '/tender-evaluations'

export const evaluationApi = {
    list: () => apiRequest<Evaluation[]>(BASE),
    detail: (tenderId: string) => apiRequest<Evaluation>(`${BASE}/${tenderId}`),
    award: (tenderId: string, bidId: string, reason: string) =>
        apiRequest<Evaluation>(`${BASE}/${tenderId}/award`, { method: 'POST', body: { bidId, reason } }),
    quotationUrl: (tenderId: string, bidId: string) => `/api/v1${BASE}/${tenderId}/bids/${bidId}/quotation`,
}

export function formatMoney(money: Money): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: money.currency, maximumFractionDigits: 0 }).format(money.amountMinor / 100)
}

export function formatMoneyShort(money: Money): string {
    const value = money.amountMinor / 100
    const symbol = money.currency === 'INR' ? '₹' : `${money.currency} `
    const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, '')
    if (value >= 1e7) return `${symbol}${trim(value / 1e7)} Cr`
    if (value >= 1e5) return `${symbol}${trim(value / 1e5)} L`
    return formatMoney(money)
}

export function formatDate(iso?: string): string {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

/** "+5.0%" / "−1.0%" / "0%": a signed percentage with a real minus sign. */
export function formatPercent(value?: number): string {
    if (value === undefined || value === null) return '—'
    if (value === 0) return '0%'
    return `${value > 0 ? '+' : '−'}${Math.abs(value).toFixed(1)}%`
}

export const STAGE_LABEL: Record<Stage, string> = {
    EVALUATION: 'Ready to evaluate',
    OPEN: 'Open, bids sealed',
    AWARDED: 'Awarded',
    CLOSED: 'Closed',
}
