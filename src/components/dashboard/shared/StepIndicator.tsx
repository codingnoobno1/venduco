// Step Indicator Component - Progress stepper
"use client"

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
    label: string
    description?: string
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (step: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between w-full">
            {steps.map((step, index) => (
                <div key={step.label} className="flex items-center flex-1 last:flex-none">
                    {/* Step Circle */}
                    <motion.button
                        whileHover={onStepClick ? { scale: 1.1 } : {}}
                        onClick={() => onStepClick?.(index)}
                        disabled={!onStepClick}
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${index < currentStep
                                ? 'bg-emerald-500 text-white'
                                : index === currentStep
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            } ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        {index < currentStep ? <Check size={18} /> : index + 1}
                    </motion.button>

                    {/* Label */}
                    <div className="ml-3 hidden sm:block">
                        <p className={`text-sm font-medium ${index === currentStep
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500'
                            }`}>
                            {step.label}
                        </p>
                        {step.description && (
                            <p className="text-xs text-slate-400">{step.description}</p>
                        )}
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div className="flex-1 mx-4 hidden sm:block">
                            <div className={`h-1 rounded-full transition-colors ${index < currentStep
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-200 dark:bg-slate-700'
                                }`} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
