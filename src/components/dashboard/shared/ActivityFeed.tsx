// ActivityFeed Component - Recent activities list
"use client"

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface Activity {
    id: string
    type: string
    title: string
    description?: string
    timestamp: string
    icon?: string
}

interface ActivityFeedProps {
    activities: Activity[]
    title?: string
    maxItems?: number
}

const typeIcons: Record<string, string> = {
    report: '📝',
    project: '📁',
    machine: '🚜',
    bid: '💰',
    rental: '🤝',
    user: '👤',
    chat: '💬',
    default: '📌',
}

export function ActivityFeed({ activities, title = 'Recent Activity', maxItems = 10 }: ActivityFeedProps) {
    const displayActivities = activities.slice(0, maxItems)

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {displayActivities.length === 0 ? (
                    <p className="p-4 text-center text-slate-500 text-sm">No recent activity</p>
                ) : (
                    displayActivities.map((activity, i) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xl">
                                    {activity.icon || typeIcons[activity.type] || typeIcons.default}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {activity.title}
                                    </p>
                                    {activity.description && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {activity.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                        <Clock size={12} />
                                        <span>{timeAgo(activity.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
