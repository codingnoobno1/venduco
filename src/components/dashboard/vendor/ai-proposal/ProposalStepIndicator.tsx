"use client"

import React from 'react'

interface ProposalStepIndicatorProps {
    currentStep: number
}

export function ProposalStepIndicator({ currentStep }: ProposalStepIndicatorProps) {
    const steps = [
        { name: "Upload", description: "Analyze Tender" },
        { name: "Analysis", description: "Extract Needs" },
        { name: "Template", description: "Select Style" },
        { name: "Generate", description: "AI Synthesis" },
        { name: "Finalize", description: "Review & Export" }
    ]

    return (
        <div className="flex justify-between items-center max-w-4xl mx-auto mb-12 relative">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
            <div
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, i) => {
                const isActive = i <= currentStep
                const isCurrent = i === currentStep

                return (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg ${isCurrent ? 'bg-blue-600 border-blue-600 text-white scale-125 ring-4 ring-blue-100 dark:ring-blue-900/30' :
                                    isActive ? 'bg-blue-600 border-blue-600 text-white' :
                                        'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}
                        >
                            <span className="text-sm font-bold">{i + 1}</span>
                        </div>
                        <div className="hidden sm:block text-center mt-2">
                            <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                                {step.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                                {step.description}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
