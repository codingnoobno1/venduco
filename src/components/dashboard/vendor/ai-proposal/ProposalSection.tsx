"use client"

import React from 'react'

interface ProposalSectionProps {
    title: string
    children: React.ReactNode
}

export function ProposalSection({ title, children }: ProposalSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-l-4 border-blue-600 pl-3">
                {title}
            </h3>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {children}
            </div>
        </div>
    )
}
