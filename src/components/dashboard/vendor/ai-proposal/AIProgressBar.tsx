"use client"

import React from 'react'

interface AIProgressBarProps {
    progress: number
}

export function AIProgressBar({ progress }: AIProgressBarProps) {
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-600 dark:text-slate-400">Analysis Progress</span>
                <span className="text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
