"use client"

import React from 'react'
import { Check } from 'lucide-react'

interface ProposalStepIndicatorProps {
    currentStep: number
}

// NOTE: globals.css overrides `.bg-blue-600` (forces position:relative / overflow:hidden) and
// `.text-xs` / `.text-sm` colours, which broke this component's absolute connector line.
// Colours here use inline styles / bg-blue-500 so the global rules don't apply.
const BLUE = '#2563eb'

export function ProposalStepIndicator({ currentStep }: ProposalStepIndicatorProps) {
    const steps = [
        { name: "Upload", description: "Analyze Tender" },
        { name: "Analysis", description: "Extract Needs" },
        { name: "Template", description: "Select Style" },
        { name: "Generate", description: "AI Synthesis" },
        { name: "Finalize", description: "Review & Export" }
    ]

    const lastIndex = steps.length - 1
    const progress = Math.min(Math.max(currentStep, 0), lastIndex) / lastIndex

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Connector track: runs from the centre of the first circle to the centre of the last */}
            <div
                className="absolute top-5 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2"
                style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }}
            >
                <div
                    className="h-full transition-[width] duration-500"
                    style={{ width: `${progress * 100}%`, backgroundColor: BLUE }}
                />
            </div>

            <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
                {steps.map((step, i) => {
                    const isDone = i < currentStep
                    const isCurrent = i === currentStep
                    const isActive = isDone || isCurrent

                    return (
                        <li key={step.name} className="flex flex-col items-center text-center px-1">
                            <div
                                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 font-bold text-[14px] transition-all duration-300 ${isCurrent ? 'ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-lg' : ''
                                    } ${isActive ? '' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 !text-slate-400'}`}
                                style={isActive ? { backgroundColor: BLUE, borderColor: BLUE, color: '#fff' } : undefined}
                            >
                                {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                            </div>
                            <div className="hidden sm:block mt-3 w-full">
                                <span
                                    className="block truncate text-[12px] leading-4 font-bold uppercase tracking-wider"
                                    style={{ color: isActive ? BLUE : '#94a3b8' }}
                                >
                                    {step.name}
                                </span>
                                <span className="block truncate text-[11px] leading-4 mt-0.5 font-medium text-slate-500">
                                    {step.description}
                                </span>
                            </div>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}
