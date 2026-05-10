"use client"

import React from 'react'
import { BarChart3, TrendingUp, Award, Target } from 'lucide-react'

export function ProposalStats() {
    const stats = [
        { label: "Compliance Score", value: "98%", icon: Award, color: "text-green-500" },
        { label: "AI Confidence", value: "94%", icon: Target, color: "text-blue-500" },
        { label: "Technical Match", value: "92%", icon: TrendingUp, color: "text-purple-500" },
        { label: "Historical Win Rate", value: "76%", icon: BarChart3, color: "text-orange-500" },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {stat.label}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
            ))}
        </div>
    )
}
