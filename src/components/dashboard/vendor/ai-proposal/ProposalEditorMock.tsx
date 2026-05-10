"use client"

import React from 'react'
import { Bold, Italic, List, ListOrdered, Link2, UserCircle, History } from 'lucide-react'

export function ProposalEditorMock() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-200 dark:border-slate-700 flex gap-2">
                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"><Bold className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"><Italic className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />
                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"><List className="w-4 h-4" /></button>
                <div className="flex-1" />
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/10 rounded-full border border-blue-100 dark:border-blue-900/20">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Multiplayer Mode</span>
                </div>
            </div>
            <div className="p-8 h-[250px] overflow-y-auto relative">
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/5 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            <span className="bg-blue-200 dark:bg-blue-800 px-1 rounded">BuildIT Global Corp is committed to delivering the highest quality infrastructure projects.</span> Our team of specialists is ready to deploy state-of-the-art machinery to ensure the successful completion of the Highway Expansion Project.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <UserCircle className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-600 tracking-tighter uppercase">Edited by John Doe</span>
                        </div>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed opacity-60">
                        We believe our technical expertise and commitment to safety make us the ideal partner for this project. Our track record spans across multiple continents...
                    </p>
                </div>

                {/* AI Overlay Suggestion */}
                <div className="absolute bottom-4 right-8 left-8 p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <History className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] text-blue-400 font-black uppercase">AI Revision Suggestion</p>
                        <p className="text-xs">Mentioning your recent 2024 ISO certification would boost compliance by 12%.</p>
                    </div>
                    <button className="text-[10px] font-black uppercase bg-white text-black px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors">Apply</button>
                </div>
            </div>
        </div>
    )
}
