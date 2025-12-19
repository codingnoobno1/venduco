// Registration Layout - Wrapper with animated background
"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { StepIndicator } from "./StepIndicator"
import Link from "next/link"

interface RegistrationLayoutProps {
    children: ReactNode
    currentStep: number
    totalSteps: number
    steps: Array<{
        number: number
        title: string
        description: string
    }>
}

export function RegistrationLayout({
    children,
    currentStep,
    totalSteps,
    steps
}: RegistrationLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-8 px-4">
            {/* Animated background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-2"
                    >
                        VendorConnect Registration
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-blue-200"
                    >
                        Complete your profile to access the platform
                    </motion.p>
                </div>

                {/* Step Indicator */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
                    <StepIndicator
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        steps={steps}
                    />
                </div>

                {/* Content Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8"
                >
                    {children}
                </motion.div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
