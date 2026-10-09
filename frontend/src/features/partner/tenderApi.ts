/**
 * Partner portal API: tenders open to the signed-in partner and their own bid on each.
 * Shapes mirror PartnerTenderController on the backend.
 */
import apiRequest, { ApiError, secureFetch } from '@/lib/api'

export interface Money {
    amountMinor: number
    currency: string
}

export interface EligibilityCheck {
    label: string
    state: 'PASSED' | 'PENDING' | 'FAILED'
    detail: string
}

export interface Bid {
    status: 'DRAFT' | 'SUBMITTED'
    amount: Money | null
    validityDays: number | null
    note: string | null
    quotation: { fileName: string; sizeBytes: number; uploadedAt: string } | null
    submittedAt: string | null
    lastSavedAt: string
}

export interface Tender {
    id: string
    title: string
    referenceNumber: string
    description: string
    project: string | null
    estimatedValue: Money
    publishDate: string | null
    closingDate: string | null
    open: boolean
    daysLeft?: number | null
    eligible: boolean
    checks: EligibilityCheck[]
    /** Bill of quantities; only filled on the detail call. */
    lines: Array<{ description: string; quantity: number; unit: string }>
    bid?: Bid | null
    /** Set once the tender has been awarded and this partner had a submitted bid. */
    outcome?: 'AWARDED_TO_YOU' | 'NOT_SELECTED'
    canEdit: boolean
    canSubmit: boolean
    canWithdraw: boolean
    /** What still stops the bid from being submitted, already worded for the bidder. */
    blockers: string[]
    maxDocumentBytes: number
}

export interface BidDraft {
    amount: Money | null
    validityDays: number | null
    note: string | null
}

const BASE = '/partner/tenders'

export const tenderApi = {
    list: () => apiRequest<Tender[]>(BASE),
    detail: (tenderId: string) => apiRequest<Tender>(`${BASE}/${tenderId}`),
    saveBid: (tenderId: string, draft: BidDraft) => apiRequest<Tender>(`${BASE}/${tenderId}/bid`, { method: 'PUT', body: draft }),
    submit: (tenderId: string) => apiRequest<Tender>(`${BASE}/${tenderId}/bid/submit`, { method: 'POST' }),
    withdraw: (tenderId: string) => apiRequest<Tender>(`${BASE}/${tenderId}/bid/withdraw`, { method: 'POST' }),
    removeQuotation: (tenderId: string) => apiRequest<Tender>(`${BASE}/${tenderId}/bid/quotation`, { method: 'DELETE' }),

    uploadQuotation: async (tenderId: string, file: File): Promise<Tender> => {
        const body = new FormData()
        body.append('file', file)
        const response = await secureFetch(`/api/v1${BASE}/${tenderId}/bid/quotation`, { method: 'POST', body })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
            throw new ApiError(response.status, data?.fieldErrors?.quotation || data?.message || `Upload failed with status ${response.status}`, data)
        }
        return data as Tender
    },

    quotationUrl: (tenderId: string) => `/api/v1${BASE}/${tenderId}/bid/quotation`,
}

export function formatMoney(money: Money): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: money.currency, maximumFractionDigits: 2 }).format(money.amountMinor / 100)
}

/** Large amounts the way they are spoken in India: "₹12.45 Cr", "₹38 L". */
export function formatMoneyShort(money: Money): string {
    const value = money.amountMinor / 100
    const symbol = money.currency === 'INR' ? '₹' : `${money.currency} `
    const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, '')
    if (value >= 1e7) return `${symbol}${trim(value / 1e7)} Cr`
    if (value >= 1e5) return `${symbol}${trim(value / 1e5)} L`
    return formatMoney(money)
}

export function closingLabel(tender: Tender): string {
    if (!tender.open) return 'Closed'
    // The API leaves out fields that have no value, so this may be undefined rather than null.
    if (tender.daysLeft == null) return 'Open'
    if (tender.daysLeft === 0) return 'Closes today'
    return tender.daysLeft === 1 ? 'Closes tomorrow' : `${tender.daysLeft} days left`
}
