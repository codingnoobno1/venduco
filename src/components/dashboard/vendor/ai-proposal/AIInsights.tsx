"use client"

import React from 'react'
import { Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'

export function AIInsights() {
    const insights = [
        { type: "tip", text: "Highlight the specific 2024 environmental certifications mentioned on page 14." },
        { type: "warning", text: "Proposal missing specific fleet maintenance history for heavy excavators." },
        { type: "success", text: "Matched 100% of required technical specifications for Section 4.B." }
    ]

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">AI Strategic Insights</h4>
            {insights.map((insight, i) => (
                <div
                    key={i}
                    className={`p-3 rounded-lg border flex gap-3 text-sm ${insight.type === 'tip' ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400' :
                            insight.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400' :
                                'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400'
                        }`}
                >
                    {insight.type === 'tip' && <Lightbulb className="w-5 h-5 shrink-0" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                    {insight.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    <p>{insight.text}</p>
                </div>
            ))}
        </div>
    )
}
