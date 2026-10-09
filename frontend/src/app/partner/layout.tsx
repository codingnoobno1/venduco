'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { PartnerProvider } from '@/features/partner/PartnerProvider'
import { PartnerShell } from '@/features/partner/PartnerShell'

/** Everything under /partner: the vendor-side portal. Sign-in is enforced by proxy.ts. */
export default function PartnerLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <PartnerProvider>
                <PartnerShell>{children}</PartnerShell>
            </PartnerProvider>
        </AuthProvider>
    )
}
