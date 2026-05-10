"use client"

import React from 'react'
import { Download, Share2, Printer } from 'lucide-react'

export function DownloadButton() {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download PDF Proposal
                </button>
                <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
            </div>
            <p className="text-[9px] text-center font-mono text-slate-400 dark:text-slate-600 uppercase tracking-tight">
                Generated via Venduco AI-Assisted Proposal Engine | Draft v1.2 | Compliance Stamp: 5A-2024
            </p>
        </div>
    )
}
