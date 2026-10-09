'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '@/lib/api'
import { partnerApi, messageOf, type Account, type Application, type StepValues } from './api'

interface PartnerState {
    /** Null until loaded, and stays null when the account is blocked. */
    application: Application | null
    account: Account | null
    loading: boolean
    /** A failure to load at all; save and upload errors are thrown to the caller instead. */
    loadError: string | null
    reload: () => Promise<void>
    saveStep: (stepKey: string, values: StepValues) => Promise<Application>
    uploadDocument: (fieldKey: string, file: File) => Promise<Application>
    removeDocument: (fieldKey: string) => Promise<Application>
    submit: (declaredAccurate: boolean, consentToShare: boolean) => Promise<Application>
}

const PartnerContext = createContext<PartnerState | null>(null)

/**
 * Holds the partner's application for every page of the portal. Each change returns the whole
 * application from the server, so progress, the missing list and step states never drift from
 * what is actually saved.
 */
export function PartnerProvider({ children }: { children: ReactNode }) {
    const [application, setApplication] = useState<Application | null>(null)
    const [account, setAccount] = useState<Account | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const reload = useCallback(async () => {
        setLoading(true)
        setLoadError(null)
        try {
            // The account comes first: it answers even when the account is blocked, and says why.
            const currentAccount = await partnerApi.account()
            setAccount(currentAccount)
            setApplication(currentAccount.canUsePlatform ? await partnerApi.application() : null)
        } catch (error) {
            // 401 is handled by the API client (it redirects to sign-in).
            if (!(error instanceof ApiError && error.status === 401)) setLoadError(messageOf(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { reload() }, [reload])

    const apply = useCallback(async (change: Promise<Application>) => {
        const updated = await change
        setApplication(updated)
        return updated
    }, [])

    const value: PartnerState = {
        application,
        account,
        loading,
        loadError,
        reload,
        saveStep: (stepKey, values) => apply(partnerApi.saveStep(stepKey, values)),
        uploadDocument: (fieldKey, file) => apply(partnerApi.uploadDocument(fieldKey, file)),
        removeDocument: fieldKey => apply(partnerApi.removeDocument(fieldKey)),
        submit: (declaredAccurate, consentToShare) => apply(partnerApi.submit(declaredAccurate, consentToShare)),
    }

    return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>
}

export function usePartner(): PartnerState {
    const context = useContext(PartnerContext)
    if (!context) throw new Error('usePartner must be used within PartnerProvider')
    return context
}
