"use client"

import React from 'react'
import { Info } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function AIModeBadge() {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 cursor-help">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider font-mono">
                            AI Assisted (Preview Mode)
                        </span>
                        <Info className="w-3 h-3 text-blue-400" />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs p-3">
                    <p>This MVP demonstrates the AI-assisted workflow using predefined logic and historical performance data.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
