"use client"

import React from 'react'
import { Sparkles, Brain, Clock, Zap } from 'lucide-react'

export function AIFeatureCard({ title, description, icon: Icon, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    )
}

export function AIFeaturesGrid() {
    const features = [
        { title: "Smart Extraction", description: "Automatically identify key requirements and deadlines from complex PDF documents.", icon: Brain, color: "bg-purple-500" },
        { title: "Compliance Mapping", description: "Ensure your proposal perfectly matches 100% of the tender's technical specifications.", icon: Zap, color: "bg-blue-500" },
        { title: "Instant Drafting", description: "Generate structured proposal sections based on your historical wins and company profile.", icon: Sparkles, color: "bg-indigo-500" },
        { title: "Audit Ready", description: "Every proposal is cross-referenced with your internal certifications for audit compliance.", icon: Clock, color: "bg-emerald-500" }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
                <AIFeatureCard key={i} {...f} />
            ))}
        </div>
    )
}
