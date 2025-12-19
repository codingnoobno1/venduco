// StatCard Component - Metric display card
"use client"

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: number
        isUp: boolean
    }
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'slate' | 'emerald'
    onClick?: () => void
}

const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    slate: 'from-slate-500 to-slate-600',
    emerald: 'from-emerald-500 to-emerald-600',
}

export function StatCard({ title, value, icon: Icon, trend, color = 'blue', onClick }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 ${onClick ? 'cursor-pointer' : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend.isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{trend.value}%</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
                    <Icon size={24} />
                </div>
            </div>
        </motion.div>
    )
}
