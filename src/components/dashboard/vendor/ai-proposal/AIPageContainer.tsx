"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, FileText, Layout, CheckCircle2 } from 'lucide-react'

interface AIPageContainerProps {
    children: React.ReactNode
}

export function AIPageContainer({ children }: AIPageContainerProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {children}
            </div>
        </div>
    )
}
