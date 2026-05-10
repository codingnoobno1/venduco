"use client"

import React from 'react'
import { Brain, Quote } from 'lucide-react'

export function ProposalReasoningPanel() {
    return (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
                <Brain className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Reasoning Model</span>
            </div>
            <div className="relative">
                <Quote className="absolute -top-1 -left-2 w-8 h-8 text-white/5" />
                <p className="text-sm italic text-slate-300 leading-relaxed pl-4">
                    "This proposal emphasizes high-speed execution experience and mobilization speed because the tender scoring matrix prioritizes prior corridor work completion within 24 months."
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Priority Factor</p>
                    <p className="text-xs font-bold text-white">Execution Speed</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tone Analysis</p>
                    <p className="text-xs font-bold text-white">Aggressive/Professional</p>
                </div>
            </div>
        </div>
    )
}
