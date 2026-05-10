"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnalysisStatusProps {
    status: string
}

export function AnalysisStatus({ status }: AnalysisStatusProps) {
    return (
        <div className="h-8 flex justify-center items-center">
            <AnimatePresence mode="wait">
                <motion.p
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-slate-500 dark:text-slate-400 font-medium text-center"
                >
                    {status}
                </motion.p>
            </AnimatePresence>
        </div>
    )
}
