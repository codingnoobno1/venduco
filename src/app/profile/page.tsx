"use client"

import { UniversalProfileEditor } from '@/components/profile/UniversalProfileEditor'

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <UniversalProfileEditor />
        </div>
    )
}
