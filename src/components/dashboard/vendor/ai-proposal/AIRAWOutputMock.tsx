"use client"

import React from 'react'
import { AlertCircle, Terminal } from 'lucide-react'

export function AIRAWOutputMock() {
    return (
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl font-mono">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <Terminal className="w-4 h-4 text-green-500" />
                <span className="text-[10px] text-slate-500 uppercase font-black">AI_CORE_SYSTEM_LOG</span>
            </div>
            <div className="space-y-1 text-[11px]">
                <p className="text-slate-600">[0.000s] INITIALIZING LLM-ENGINE-KRONOS</p>
                <p className="text-slate-300">[1.241s] STREAMING TENDER BYTECODE...</p>
                <p className="text-blue-400">[2.455s] PATTERN MATCHING: SECTION_ELGIBILITY_4.1</p>
                <p className="text-green-400">[3.899s] CONFIDENCE SCORE: 0.99823445</p>
                <p className="text-purple-400">[4.112s] GENERATING SYNTHESIS MODEL...</p>
                <p className="text-slate-600 animate-pulse">[...] PROCESSING_DATA_VECTORS</p>
            </div>
            <div className="mt-4 flex gap-2">
                <div className="h-1 flex-1 bg-green-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-3/4 animate-pulse" />
                </div>
            </div>
        </div>
    )
}
