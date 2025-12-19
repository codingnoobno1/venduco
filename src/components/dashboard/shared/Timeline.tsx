// Timeline Component - Activity/Milestone Timeline
"use client"

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

interface TimelineItem {
    id: string
    title: string
    description?: string
    date: string
    status: 'completed' | 'current' | 'pending' | 'warning'
}

interface TimelineProps {
    items: TimelineItem[]
    title?: string
}

const statusConfig = {
    completed: {
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        line: 'bg-emerald-500',
    },
    current: {
        icon: Clock,
        color: 'text-blue-500',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        line: 'bg-slate-300 dark:bg-slate-600',
    },
    pending: {
        icon: Circle,
        color: 'text-slate-400',
        bg: 'bg-slate-100 dark:bg-slate-700',
        line: 'bg-slate-300 dark:bg-slate-600',
    },
    warning: {
        icon: AlertCircle,
        color: 'text-orange-500',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        line: 'bg-slate-300 dark:bg-slate-600',
    },
}

export function Timeline({ items, title }: TimelineProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            {title && (
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
            )}
            <div className="relative">
                {items.map((item, index) => {
                    const config = statusConfig[item.status]
                    const Icon = config.icon

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-8 pb-6 last:pb-0"
                        >
                            {/* Connector Line */}
                            {index < items.length - 1 && (
                                <div className={`absolute left-[15px] top-8 w-0.5 h-full ${config.line}`} />
                            )}

                            {/* Icon */}
                            <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                                <Icon size={16} className={config.color} />
                            </div>

                            {/* Content */}
                            <div className="ml-2">
                                <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                                {item.description && (
                                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                )}
                                <p className="text-xs text-slate-400 mt-1">{item.date}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
