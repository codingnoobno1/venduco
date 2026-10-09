// LoadingSkeleton Component - Loading placeholder
"use client"

interface LoadingSkeletonProps {
    type?: 'card' | 'table' | 'stat' | 'text'
    count?: number
}

export function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
    const items = Array.from({ length: count })

    if (type === 'stat') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse">
                        <div className="flex justify-between">
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3" />
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                            </div>
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (type === 'table') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                </div>
                {items.map((_, i) => (
                    <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                    </div>
                ))}
            </div>
        )
    }

    if (type === 'text') {
        return (
            <div className="space-y-2 animate-pulse">
                {items.map((_, i) => (
                    <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${80 - i * 10}%` }} />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 animate-pulse">
                    <div className="flex justify-between mb-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-4" />
                    <div className="flex gap-4">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                    </div>
                </div>
            ))}
        </div>
    )
}
