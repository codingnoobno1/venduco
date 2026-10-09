'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePartner } from '@/features/partner/PartnerProvider'
import { REVIEW_STEP } from '@/features/partner/Stepper'

/** "Application" in the navigation: goes to the first section that still needs work. */
export default function QualificationIndexPage() {
    const router = useRouter()
    const { application } = usePartner()

    useEffect(() => {
        if (!application) return
        const next = application.editable ? application.steps.find(step => step.state !== 'COMPLETED')?.key : undefined
        router.replace(`/partner/qualification/${next ?? REVIEW_STEP}`)
    }, [application, router])

    return null
}
