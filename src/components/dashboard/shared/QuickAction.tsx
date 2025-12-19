// QuickAction Component - Action button card
"use client"

import { motion } from 'framer-motion'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface QuickActionProps {
    title: string
    description?: string
    icon: LucideIcon
    onClick: () => void
    color?: 'blue' | 'green' | 'orange' | 'purple'
}

const colorClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    orange: 'from-orange-500 to-amber-600',
    purple: 'from-purple-500 to-pink-600',
}

export function QuickAction({ title, description, icon: Icon, onClick, color = 'blue' }: QuickActionProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-left hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
                    {description && (
                        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    )}
                </div>
                <ChevronRight size={20} className="text-slate-400" />
            </div>
        </motion.button>
    )
}
