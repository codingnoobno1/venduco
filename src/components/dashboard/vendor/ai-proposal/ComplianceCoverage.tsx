"use client"

import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'

export function ComplianceCoverage() {
    const criteria = [
        { label: "Technical Scope", level: 100, status: 'success' },
        { label: "Financial Turn-over", level: 85, status: 'warning' },
        { label: "Machinery Proof", level: 100, status: 'success' },
        { label: "Health & Safety", level: 90, status: 'success' }
    ]

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Compliance Coverage</h4>
            </div>
            <div className="space-y-5">
                {criteria.map((item, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                            <span className={item.status === 'success' ? 'text-emerald-600' : 'text-amber-500'}>
                                {item.level}% {item.status === 'success' ? '✔' : '⚠'}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${item.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                style={{ width: `${item.level}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium leading-tight">
                    Financial clause pending final bank guarantee upload. Technical score optimal.
                </p>
            </div>
        </div>
    )
}
