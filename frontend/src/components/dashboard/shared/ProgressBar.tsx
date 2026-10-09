// Progress Bar Component
"use client"

import { motion } from 'framer-motion'

interface ProgressBarProps {
    value: number
    max?: number
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    label?: string
    animated?: boolean
}

const colorClasses = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-amber-500',
    purple: 'from-purple-500 to-violet-500',
    red: 'from-red-500 to-rose-500',
    yellow: 'from-yellow-500 to-amber-500',
}

const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
}

export function ProgressBar({
    value,
    max = 100,
    color = 'blue',
    size = 'md',
    showLabel = false,
    label,
    animated = true,
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
        <div>
            {(showLabel || label) && (
                <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{label || 'Progress'}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{percentage.toFixed(0)}%</span>
                </div>
            )}
            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <motion.div
                    initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
                />
            </div>
        </div>
    )
}
