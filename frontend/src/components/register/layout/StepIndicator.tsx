// Step Indicator Component - Visual progress tracker
"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface StepIndicatorProps {
    currentStep: number
    totalSteps: number
    steps: {
        number: number
        title: string
        description: string
    }[]
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
    return (
        <div className="w-full mb-8">
            {/* Mobile: Simple progress bar */}
            <div className="block md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-sm text-blue-200">
                        {Math.round((currentStep / totalSteps) * 100)}%
                    </span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Desktop: Full step indicator */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: currentStep >= step.number ? 1 : 0.9 }}
                                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold
                  ${currentStep > step.number
                                        ? "bg-green-500 text-white"
                                        : currentStep === step.number
                                            ? "bg-white text-blue-600 ring-4 ring-blue-300"
                                            : "bg-white/20 text-white/60"
                                    }
                  transition-all duration-300
                `}
                            >
                                {currentStep > step.number ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    step.number
                                )}
                            </motion.div>
                            <div className="mt-2 text-center">
                                <div className={`text-sm font-medium ${currentStep >= step.number ? "text-white" : "text-white/60"
                                    }`}>
                                    {step.title}
                                </div>
                                <div className="text-xs text-blue-200 mt-1">
                                    {step.description}
                                </div>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 mx-4 mt-[-40px]">
                                <div className="h-full bg-white/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-white"
                                        initial={{ width: "0%" }}
                                        animate={{ width: currentStep > step.number ? "100%" : "0%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
