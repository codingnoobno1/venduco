"use client"

import React from 'react'
import { CheckCircle2 } from 'lucide-react'

interface RequirementCardProps {
    title: string
    description: string
}

export function RequirementCard({ title, description }: RequirementCardProps) {
    // Mock confidence level logic
    const confidenceMap: Record<string, { label: string, color: string }> = {
        "Technical Compliance": { label: "High Confidence", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
        "Financial Stability": { label: "Medium Confidence", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
        "Past Experience": { label: "Needs Review", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        "Safety Standards": { label: "High Confidence", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" }
    }

    const confidence = confidenceMap[title] || { label: "Unknown", color: "bg-slate-100 text-slate-700" }

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h4>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${confidence.color}`}>
                        {confidence.label}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    {description}
                </p>
            </div>
        </div>
    )
}
