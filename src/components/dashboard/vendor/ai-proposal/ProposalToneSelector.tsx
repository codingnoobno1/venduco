"use client"

import React from 'react'
import { MessageSquareText } from 'lucide-react'

interface ProposalToneSelectorProps {
    value: string
    onChange: (tone: string) => void
}

export function ProposalToneSelector({ value, onChange }: ProposalToneSelectorProps) {
    const tones = [
        { id: 'conservative', label: 'Conservative', desc: 'Focus on reliability & risk mitigation' },
        { id: 'balanced', label: 'Balanced', desc: 'Equal weight to price and innovation' },
        { id: 'aggressive', label: 'Aggressive', desc: 'Highlight speed & disruption capabilities' }
    ]

    return (
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquareText className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Linguistic Tone Control</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tones.map((tone) => (
                    <button
                        key={tone.id}
                        onClick={() => onChange(tone.id)}
                        className={`text-left p-4 rounded-xl border transition-all ${value === tone.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-2 ring-blue-500/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        <p className={`text-sm font-bold mb-1 ${value === tone.id ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                            {tone.label}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{tone.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}
