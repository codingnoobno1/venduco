"use client"

import React from 'react'
import { FileText, Fullscreen, Download, Search } from 'lucide-react'

export function PDFViewerMock() {
    return (
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl h-[600px] flex flex-col">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <FileText className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">sampletendor.pdf</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">148 KB • 12 Pages</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500">
                        <Search className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500">
                        <Fullscreen className="w-4 h-4" />
                    </button>
                    <a href="/sampletendor.pdf" download className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500">
                        <Download className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-hidden relative">
                <iframe
                    src="/sampletendor.pdf#toolbar=0"
                    className="w-full h-full border-none"
                    title="Tender Document Viewer"
                />

                {/* AI Overlay Layer (Simulated) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[20%] left-[10%] w-[30%] h-6 bg-blue-500/10 border border-blue-500/30 rounded animate-pulse" />
                    <div className="absolute top-[45%] left-[15%] w-[40%] h-8 bg-indigo-500/10 border border-indigo-500/30 rounded animate-pulse" />
                    <div className="absolute top-[70%] left-[5%] w-[25%] h-6 bg-purple-500/10 border border-purple-500/30 rounded animate-pulse" />
                </div>
            </div>

            {/* Footer / Pages */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Page 1 of 12</div>
            </div>
        </div>
    )
}
