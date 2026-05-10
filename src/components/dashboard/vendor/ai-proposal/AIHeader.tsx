"use client"

import React from 'react'
import { Sparkles } from 'lucide-react'

export function AIHeader() {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    AI Vendor Proposal Maker
                </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
                Generate professional, high-compliance proposals in seconds using AI-powered analysis of tender documents.
            </p>
        </div>
    )
}
