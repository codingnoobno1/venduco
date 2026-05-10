"use client"

import React from 'react'
import { Info, Sparkles } from 'lucide-react'

export function ProposalSummaryMock() {
    return (
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-widest text-xs">AI Synthesis Summary</h4>
            </div>
            <p className="text-lg font-medium leading-relaxed mb-6">
                "We have crafted a proposal for the <span className="underline decoration-blue-300">Highway Expansion Project</span> that emphasizes your company's unique 18-year history and 98% technical compliance. The proposal leverages the 'Modern Technical' template to align with the client's preference for data-driven decisions."
            </p>
            <div className="flex items-center gap-2 text-blue-100 text-xs bg-black/20 p-3 rounded-lg border border-white/10">
                <Info className="w-4 h-4 shrink-0" />
                <p>AI ensured all mandatory ISO certifications were included in the first section for maximum visibility.</p>
            </div>
        </div>
    )
}
