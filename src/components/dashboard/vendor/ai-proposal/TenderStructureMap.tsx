"use client"

import React from 'react'
import { ListTree, TableOfContents } from 'lucide-react'

export function TenderStructureMap() {
    const nodes = [
        { id: '1', title: 'Scope of Work', status: 'extracted' },
        { id: '2', title: 'Eligibility Criteria', status: 'extracted' },
        { id: '3', title: 'Commercial Terms', status: 'extracted' },
        { id: '4', title: 'Submission Checklist', status: 'pending' },
        { id: '5', title: 'Technical Annexures', status: 'extracted' }
    ]

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
                <TableOfContents className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Tender Map</h4>
            </div>
            <div className="space-y-2">
                {nodes.map((node) => (
                    <div key={node.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${node.status === 'extracted' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{node.title}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
