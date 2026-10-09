/**
 * Partner portal API: the signed-in partner's own qualification application.
 * Shapes mirror PartnerQualificationController on the backend.
 */
import apiRequest, { ApiError, secureFetch } from '@/lib/api'

export type FieldType =
    | 'TEXT' | 'TEXTAREA' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE'
    | 'SELECT' | 'MULTI_SELECT' | 'YES_NO' | 'DOCUMENT'

export type StepState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'CORRECTION_REQUIRED' | 'APPROVED' | 'REJECTED'

export interface UploadedDocument {
    fileName: string
    contentType: string
    sizeBytes: number
    uploadedAt: string
}

export interface Field {
    key: string
    label: string
    type: FieldType
    /** Required given the answers saved so far. */
    required: boolean
    options: string[]
    hint: string | null
    /** Never returned in full: `value` is null and `maskedValue` shows the last characters. */
    sensitive: boolean
    requiredWhen: { field: string; equals: string } | null
    value: string | string[] | null
    maskedValue: string | null
    document: UploadedDocument | null
    satisfied: boolean
}

export interface Step {
    key: string
    title: string
    shortTitle: string
    intro: string
    state: StepState
    fields: Field[]
}

export interface MissingItem {
    stepKey: string
    stepTitle: string
    fieldKey: string
    label: string
    kind: 'ANSWER' | 'DOCUMENT'
}

export interface Application {
    applicant: string
    status: ApplicationStatus
    version: number
    editable: boolean
    canSubmit: boolean
    submittedAt: string | null
    reviewNote: string | null
    lastSavedAt: string | null
    sectionsCompleted: number
    sectionsTotal: number
    maxDocumentBytes: number
    steps: Step[]
    missing: MissingItem[]
}

/** Why the account can or cannot use the platform right now. */
export interface Account {
    approvalStatus: string
    company: string | null
    companyApprovalStatus: string | null
    plan: string | null
    subscriptionStanding: string | null
    paidUntil: string | null
    amountDue: { amountMinor: number; currency: string } | null
    canUsePlatform: boolean
    blockedReason: string | null
}

export type StepValues = Record<string, string | string[]>

const BASE = '/partner/qualification'

export const partnerApi = {
    account: () => apiRequest<Account>('/me/account'),

    application: () => apiRequest<Application>(BASE),

    saveStep: (stepKey: string, values: StepValues) =>
        apiRequest<Application>(`${BASE}/steps/${stepKey}`, { method: 'PUT', body: { values } }),

    submit: (declaredAccurate: boolean, consentToShare: boolean) =>
        apiRequest<Application>(`${BASE}/submit`, { method: 'POST', body: { declaredAccurate, consentToShare } }),

    removeDocument: (fieldKey: string) =>
        apiRequest<Application>(`${BASE}/documents/${fieldKey}`, { method: 'DELETE' }),

    /** Multipart, so it goes through secureFetch rather than the JSON helper. */
    uploadDocument: async (fieldKey: string, file: File): Promise<Application> => {
        const body = new FormData()
        body.append('file', file)
        const response = await secureFetch(`/api/v1${BASE}/documents/${fieldKey}`, { method: 'POST', body })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
            throw new ApiError(response.status, data?.message || `Upload failed with status ${response.status}`, data)
        }
        return data as Application
    },

    documentUrl: (fieldKey: string) => `/api/v1${BASE}/documents/${fieldKey}/content`,
}

/** Per-field messages from a refused save, or an empty object if the error was not about fields. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
    if (error instanceof ApiError && error.data && typeof error.data === 'object') {
        const fieldErrors = (error.data as { fieldErrors?: Record<string, string> }).fieldErrors
        if (fieldErrors) return fieldErrors
    }
    return {}
}

export function messageOf(error: unknown): string {
    return error instanceof ApiError ? error.message : 'Something went wrong. Check your connection and try again.'
}
