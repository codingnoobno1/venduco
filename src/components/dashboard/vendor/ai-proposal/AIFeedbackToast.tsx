"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Sparkles } from 'lucide-react'

interface AIFeedbackToastProps {
    message: string
    visible: boolean
}

export function AIFeedbackToast({ message, visible }: AIFeedbackToastProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700"
                >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI Agent Notice</p>
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
