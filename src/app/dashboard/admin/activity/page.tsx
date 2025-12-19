// Admin Activity Log Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    User,
    FileText,
    Settings,
    RefreshCw,
    Filter,
    Clock,
} from 'lucide-react'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

const activityIcons: Record<string, any> = {
    USER: User,
    PROJECT: FileText,
    SYSTEM: Settings,
    DEFAULT: Activity,
}

export default function AdminActivityPage() {
    const [loading, setLoading] = useState(true)
    const [activities, setActivities] = useState<any[]>([])
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchActivities()
    }, [filter])

    async function fetchActivities() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/admin/activity?type=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setActivities(data.data || [])
        } catch (error) {
            console.error('Failed to fetch activities:', error)
            // Mock data
            setActivities([
                { type: 'USER', action: 'User registered', user: 'Amit Kumar', meta: 'VENDOR', timestamp: new Date() },
                { type: 'PROJECT', action: 'Project created', user: 'Rahul Singh', meta: 'Metro Bridge', timestamp: new Date(Date.now() - 3600000) },
                { type: 'USER', action: 'User verified', user: 'Admin', meta: 'Rajesh Sharma', timestamp: new Date(Date.now() - 7200000) },
                { type: 'SYSTEM', action: 'Daily reports generated', user: 'System', meta: '15 reports', timestamp: new Date(Date.now() - 86400000) },
            ])
        } finally {
            setLoading(false)
        }
    }

    function formatTime(date: Date) {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Log</h1>
                    <p className="text-slate-500 mt-1">Recent platform activity</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    >
                        <option value="all">All Activity</option>
                        <option value="USER">Users</option>
                        <option value="PROJECT">Projects</option>
                        <option value="SYSTEM">System</option>
                    </select>
                    <button onClick={fetchActivities} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                <div className="space-y-6">
                    {activities.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                            <Activity size={48} className="mx-auto mb-4 text-slate-400" />
                            <p>No activity logs</p>
                        </div>
                    ) : (
                        activities.map((activity, idx) => {
                            const Icon = activityIcons[activity.type] || activityIcons.DEFAULT
                            const isLast = idx === activities.length - 1

                            return (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'USER' ? 'bg-blue-100 text-blue-600' :
                                                activity.type === 'PROJECT' ? 'bg-green-100 text-green-600' :
                                                    activity.type === 'SYSTEM' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            <Icon size={20} />
                                        </div>
                                        {!isLast && (
                                            <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium">{activity.action}</p>
                                                <p className="text-sm text-slate-500">
                                                    by <span className="font-medium">{activity.user}</span>
                                                    {activity.meta && (
                                                        <span className="ml-2">
                                                            • <StatusBadge status={activity.meta} />
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {formatTime(activity.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
