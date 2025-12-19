// Global Error Page
"use client"

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center px-6">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Something went wrong
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    )
}
