"use client"

import React from 'react'
import { History, UserCircle, Bot } from 'lucide-react'

export function ProposalVersionHistory() {
    const history = [
        { version: 'v1.2', label: 'Final Submission', time: '2 mins ago', author: 'user' },
        { version: 'v1.1', label: 'Manual Enhancements', time: '5 mins ago', author: 'user' },
        { version: 'v1.0', label: 'Initial AI Draft', time: '8 mins ago', author: 'ai' }
    ]

    return (
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
                <History className="w-4 h-4 text-slate-400" />
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Version History</h4>
            </div>
            <div className="space-y-4">
                {history.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${item.author === 'ai' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'} dark:bg-opacity-10`}>
                                {item.author === 'ai' ? <Bot className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">{item.label}</p>
                                <p className="text-[10px] text-slate-500">{item.time}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase cursor-pointer">
                            RESTORE {item.version}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
