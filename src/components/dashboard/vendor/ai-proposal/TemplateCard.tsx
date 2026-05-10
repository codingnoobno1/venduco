"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle } from 'lucide-react'

interface TemplateCardProps {
    id: string
    name: string
    description: string
    selected: boolean
    onSelect: (id: string) => void
}

export function TemplateCard({ id, name, description, selected, onSelect }: TemplateCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-all duration-300 ${selected
                    ? 'ring-2 ring-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'hover:border-blue-400 dark:hover:border-blue-500'
                }`}
            onClick={() => onSelect(id)}
        >
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                        <div className={`w-8 h-8 rounded border-2 flex items-center justify-center ${selected ? 'border-blue-600 text-blue-600' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                            <span className="text-xs font-bold font-mono">PDF</span>
                        </div>
                    </div>
                    {selected ? (
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    ) : (
                        <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
