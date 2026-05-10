"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Brain, Loader2 } from 'lucide-react'

export function AIAnalyzingAnimation() {
    return (
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            {/* Pulsing circles */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute w-full h-full border-4 border-blue-500/30 rounded-full"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute w-[80%] h-[80%] border-4 border-indigo-500/20 rounded-full"
            />

            {/* Rotating ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute w-full h-full border-t-4 border-blue-600 rounded-full"
            />

            {/* Inner content */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Brain className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Analyzing Tender...
                    </span>
                </div>
            </div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: [Math.random() * 10 - 5, Math.random() * 100 - 50, Math.random() * 10 - 5],
                        y: [Math.random() * 10 - 5, Math.random() * -100 + 50, Math.random() * 10 - 5],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                    }}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full"
                />
            ))}
        </div>
    )
}
