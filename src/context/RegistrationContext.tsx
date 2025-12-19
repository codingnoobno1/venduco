// Registration Context - State management for multi-step registration
"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface RegistrationData {
    // Step 1
    name: string
    email: string
    phone: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
    // Step 2
    city: string
    state: string
    preferredLanguage: string
    requestedRole: string
    operatingRegions: string[]
    // Vendor
    businessType: string
    businessName: string
    yearsOfOperation: string
    serviceCategories: string[]
    gstNumber: string
    panNumber: string
    bankAccountNumber: string
    ifscCode: string
    bankAccountName: string
    // PM
    employmentType: string
    currentOrganization: string
    yearsOfExperience: string
    pastProjects: string
    certifications: string
    declarationAccepted: boolean
    // Supervisor
    siteExperience: string
    skillCategories: string[]
    workingUnderType: string
    workingUnderName: string
    // Documents
    documents: Record<string, File>
}

interface RegistrationContextType {
    data: RegistrationData
    token: string | null
    userId: string | null
    currentStep: number
    loading: boolean
    error: string | null
    updateData: (updates: Partial<RegistrationData>) => void
    submitStep1: () => Promise<boolean>
    submitStep2: () => Promise<boolean>
    submitStep3: () => Promise<boolean>
    submitForVerification: () => Promise<boolean>
    setStep: (step: number) => void
    clearError: () => void
}

const initialData: RegistrationData = {
    name: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false,
    city: '', state: '', preferredLanguage: 'en', requestedRole: '', operatingRegions: [],
    businessType: '', businessName: '', yearsOfOperation: '', serviceCategories: [],
    gstNumber: '', panNumber: '', bankAccountNumber: '', ifscCode: '', bankAccountName: '',
    employmentType: '', currentOrganization: '', yearsOfExperience: '', pastProjects: '',
    certifications: '', declarationAccepted: false,
    siteExperience: '', skillCategories: [], workingUnderType: '', workingUnderName: '',
    documents: {},
}

const RegistrationContext = createContext<RegistrationContextType | null>(null)

export function RegistrationProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<RegistrationData>(initialData)
    const [token, setToken] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateData = useCallback((updates: Partial<RegistrationData>) => {
        setData(prev => ({ ...prev, ...updates }))
    }, [])

    const clearError = useCallback(() => setError(null), [])

    const submitStep1 = useCallback(async (): Promise<boolean> => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/registration/step1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                }),
            })
            const result = await res.json()

            if (result.success) {
                setToken(result.data.token)
                setUserId(result.data.userId)
                localStorage.setItem('registration_token', result.data.token)
                setCurrentStep(2)
                return true
            } else {
                setError(result.message || 'Registration failed')
                return false
            }
        } catch (err) {
            setError('Network error. Please try again.')
            return false
        } finally {
            setLoading(false)
        }
    }, [data])

    const submitStep2 = useCallback(async (): Promise<boolean> => {
        setLoading(true)
        setError(null)
        const authToken = token || localStorage.getItem('registration_token')

        try {
            const res = await fetch('/api/registration/step2', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    city: data.city,
                    state: data.state,
                    preferredLanguage: data.preferredLanguage,
                    requestedRole: data.requestedRole,
                    operatingRegions: data.operatingRegions,
                }),
            })
            const result = await res.json()

            if (result.success) {
                setCurrentStep(3)
                return true
            } else {
                setError(result.message || 'Profile update failed')
                return false
            }
        } catch (err) {
            setError('Network error. Please try again.')
            return false
        } finally {
            setLoading(false)
        }
    }, [data, token])

    const submitStep3 = useCallback(async (): Promise<boolean> => {
        setLoading(true)
        setError(null)
        const authToken = token || localStorage.getItem('registration_token')

        let bodyData: any = {}

        // Build body based on role
        if (data.requestedRole === 'VENDOR' || data.requestedRole === 'COMPANY_REP') {
            bodyData = {
                businessType: data.businessType,
                businessName: data.businessName,
                yearsOfOperation: parseInt(data.yearsOfOperation) || 0,
                serviceCategories: data.serviceCategories,
                gstNumber: data.gstNumber,
                panNumber: data.panNumber,
                bankAccountNumber: data.bankAccountNumber,
                ifscCode: data.ifscCode,
                bankAccountName: data.bankAccountName,
            }
        } else if (data.requestedRole === 'PROJECT_MANAGER') {
            bodyData = {
                employmentType: data.employmentType,
                currentOrganization: data.currentOrganization,
                yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
                pastProjects: data.pastProjects,
                certifications: data.certifications,
                declarationAccepted: data.declarationAccepted,
            }
        } else if (data.requestedRole === 'SUPERVISOR') {
            bodyData = {
                siteExperience: parseInt(data.siteExperience) || 0,
                skillCategories: data.skillCategories,
                workingUnderType: data.workingUnderType,
                workingUnderName: data.workingUnderName,
            }
        }

        try {
            const res = await fetch('/api/registration/step3', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(bodyData),
            })
            const result = await res.json()

            if (result.success) {
                setCurrentStep(4)
                return true
            } else {
                setError(result.message || 'Details update failed')
                return false
            }
        } catch (err) {
            setError('Network error. Please try again.')
            return false
        } finally {
            setLoading(false)
        }
    }, [data, token])

    const submitForVerification = useCallback(async (): Promise<boolean> => {
        setLoading(true)
        setError(null)
        const authToken = token || localStorage.getItem('registration_token')

        try {
            const res = await fetch('/api/registration/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({}),
            })
            const result = await res.json()

            if (result.success) {
                setCurrentStep(5)
                return true
            } else {
                setError(result.message || 'Submission failed')
                return false
            }
        } catch (err) {
            setError('Network error. Please try again.')
            return false
        } finally {
            setLoading(false)
        }
    }, [token])

    const setStep = useCallback((step: number) => setCurrentStep(step), [])

    return (
        <RegistrationContext.Provider value={{
            data, token, userId, currentStep, loading, error,
            updateData, submitStep1, submitStep2, submitStep3,
            submitForVerification, setStep, clearError,
        }}>
            {children}
        </RegistrationContext.Provider>
    )
}

export function useRegistration() {
    const context = useContext(RegistrationContext)
    if (!context) {
        throw new Error('useRegistration must be used within RegistrationProvider')
    }
    return context
}
