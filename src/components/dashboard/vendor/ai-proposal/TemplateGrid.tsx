"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { TemplateCard } from './TemplateCard'

interface TemplateGridProps {
    selectedTemplate: string
    onSelect: (id: string) => void
}

export function TemplateGrid({ selectedTemplate, onSelect }: TemplateGridProps) {
    const templates = [
        {
            id: 'modern',
            name: 'L&T Style EPC',
            description: 'Massive infrastructure focus. Optimized for large-scale engineering project documents with detailed annexures.'
        },
        {
            id: 'executive',
            name: 'Mid-size Electrical',
            description: 'Focused on precision & technical specifications. Ideal for specialized sub-contractor bids.'
        },
        {
            id: 'detailed',
            name: 'Specialized OEM Vendor',
            description: 'Equipment-centric layout. Highlights machinery specs, lifetime value, and maintenance reliability.'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl) => (
                <TemplateCard
                    key={tpl.id}
                    id={tpl.id}
                    name={tpl.name}
                    description={tpl.description}
                    selected={selectedTemplate === tpl.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}
