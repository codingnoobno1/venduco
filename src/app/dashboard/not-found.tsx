// Dashboard 404 Not Found Page
"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function DashboardNotFound() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center px-6">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Search size={40} className="text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Page Not Found
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    This dashboard page doesn't exist or you don't have access.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <Link
                        href="/dashboard"
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Home size={18} />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
