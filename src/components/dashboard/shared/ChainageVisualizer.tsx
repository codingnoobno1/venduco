"use client"

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Ruler, Lock } from 'lucide-react'

interface Section {
    _id: string
    sectionCode: string
    fromKm: number
    toKm: number
    lengthKm: number
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
}

interface ChainageVisualizerProps {
    sections: Section[]
    onSectionClick?: (section: Section) => void
}

export function ChainageVisualizer({ sections, onSectionClick }: ChainageVisualizerProps) {
    // Sort sections by chainage
    const sortedSections = [...sections].sort((a, b) => a.fromKm - b.fromKm)

    // Check for continuity breaches
    const breaches = sortedSections.map((section, index) => {
        if (index === 0) return false
        const prev = sortedSections[index - 1]
        return section.status === 'COMPLETED' && prev.status !== 'COMPLETED'
    })

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-1 min-w-max p-4">
                {sortedSections.map((section, index) => {
                    const isBreach = breaches[index]
                    const statusColors = {
                        NOT_STARTED: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                        IN_PROGRESS: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                        COMPLETED: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                    }

                    const badgeColors = {
                        NOT_STARTED: 'text-slate-500 bg-slate-200 dark:bg-slate-700',
                        IN_PROGRESS: 'text-blue-600 bg-blue-100 dark:bg-blue-800/40',
                        COMPLETED: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-800/40',
                    }

                    return (
                        <div key={section._id || `section-${index}`} className="flex items-center">
                            {/* Connector */}
                            {index > 0 && (
                                <div className={`w-8 h-1 ${sortedSections[index - 1].status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            )}

                            {/* Section Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                onClick={() => onSectionClick?.(section)}
                                className={`relative w-48 p-4 rounded-xl border-2 cursor-pointer transition-all ${statusColors[section.status]} ${isBreach ? 'border-amber-500 shadow-lg shadow-amber-500/20' : ''}`}
                            >
                                {isBreach && (
                                    <div className="absolute -top-3 -right-3 p-1.5 bg-amber-500 text-white rounded-full shadow-lg" title="Continuity Breach">
                                        <AlertTriangle size={14} />
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeColors[section.status]}`}>
                                        {section.status.replace('_', ' ')}
                                    </span>
                                    {section.status === 'COMPLETED' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Lock size={16} className="text-slate-400" />}
                                </div>

                                <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                    {section.sectionCode}
                                </h4>

                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <Ruler size={12} />
                                    <span>Km {section.fromKm} - {section.toKm}</span>
                                </div>

                                <div className="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                    Length: {section.lengthKm} KM
                                </div>
                            </motion.div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
