"use client"

import React from 'react'
import { AlertCircle, AlertTriangle } from 'lucide-react'

export function RiskFlags() {
    const risks = [
        { title: "Past Experience Gap", desc: "Experience partially overlaps scope (Bridge work vs Highway).", severity: "low" },
        { title: "Clause 7.3 Compliance", desc: "Special certification for sub-terranean works required.", severity: "medium" }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Risk Assessment</h4>
            </div>
            {risks.map((risk, i) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900 dark:text-white underline decoration-amber-500 decoration-2">{risk.title}</span>
                        <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${risk.severity === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                            {risk.severity} risk
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {risk.desc}
                    </p>
                </div>
            ))}
        </div>
    )
}
