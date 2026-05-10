"use client"

import React from 'react'
import { Lock } from 'lucide-react'

interface AIFlowGateProps {
    isLocked: boolean
    children: React.ReactNode
    message: string
}

export function AIFlowGate({ isLocked, children, message }: AIFlowGateProps) {
    if (!isLocked) return <>{children}</>

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-10 rounded-3xl flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest text-xs">Section Locked</h4>
                <p className="text-xs text-slate-500 max-w-[200px]">{message}</p>
            </div>
            <div className="opacity-20 pointer-events-none filter blur-[4px]">
                {children}
            </div>
        </div>
    )
}
