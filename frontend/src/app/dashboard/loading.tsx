// Dashboard Loading Page
"use client"

import { motion } from 'framer-motion'

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
                </div>
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between">
                            <div>
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
                            </div>
                            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
