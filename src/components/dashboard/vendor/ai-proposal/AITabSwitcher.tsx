"use client"

import React from 'react'
import { Layout, FileText, CheckCircle2, Sparkles, Brain } from 'lucide-react'

interface AITabSwitcherProps {
    currentStep: number
    onStepClick: (step: number) => void
}

export function AITabSwitcher({ currentStep, onStepClick }: AITabSwitcherProps) {
    const tabs = [
        { name: "Drafting", icon: FileText },
        { name: "Requirements", icon: Brain },
        { name: "Styling", icon: Layout },
        { name: "Review", icon: CheckCircle2 }
    ]

    return (
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-lg">
            {tabs.map((tab, i) => {
                const isActive = (currentStep === 0 && i === 0) ||
                    (currentStep === 1 && i === 1) ||
                    (currentStep === 2 && i === 2) ||
                    (currentStep >= 3 && i === 3)

                return (
                    <button
                        key={i}
                        disabled={currentStep < i && i !== 0}
                        onClick={() => onStepClick(i)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${isActive
                                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.name}
                    </button>
                )
            })}
        </div>
    )
}
