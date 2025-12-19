// PM Weekly View Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    Lock,
    Unlock,
    DollarSign,
    AlertTriangle,
    Clock,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function PMWeeklyPage() {
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('')
    const [weekOffset, setWeekOffset] = useState(0)
    const [weekData, setWeekData] = useState<any[]>([])
    const [summary, setSummary] = useState({
        daysLocked: 0,
        totalCost: 0,
        openIssues: 0,
        delayedTasks: 0,
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            fetchWeekData()
        }
    }, [selectedProject, weekOffset])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            const projectList = data.data || []
            setProjects(projectList)
            if (projectList.length > 0) {
                setSelectedProject(projectList[0]._id)
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchWeekData() {
        const token = localStorage.getItem('token')

        // Calculate week dates
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)) // Monday
        startOfWeek.setHours(0, 0, 0, 0)

        const days: any[] = []
        let totalCost = 0
        let daysLocked = 0

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)

            try {
                const res = await fetch(
                    `/api/daily-summary/${date.toISOString().split('T')[0]}?projectId=${selectedProject}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                const data = await res.json()

                if (data.success && data.data) {
                    days.push({
                        date,
                        ...data.data,
                    })
                    totalCost += data.data.totalDayCost || 0
                    if (data.data.isLocked) daysLocked++
                } else {
                    days.push({ date, isEmpty: true })
                }
            } catch (error) {
                days.push({ date, isEmpty: true })
            }
        }

        setWeekData(days)
        setSummary({
            daysLocked,
            totalCost,
            openIssues: days.reduce((sum, d) => sum + (d.issues?.open || 0), 0),
            delayedTasks: 0, // TODO: Calculate from tasks with overdue dates
        })
    }

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 + (weekOffset * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    if (loading) {
        return <LoadingSkeleton type="table" count={7} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Overview</h1>
                    <p className="text-slate-500 mt-1">
                        {weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    >
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setWeekOffset(weekOffset - 1)}
                            className="p-2 border rounded-lg hover:bg-slate-100"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setWeekOffset(0)}
                            className="px-3 py-2 border rounded-lg text-sm hover:bg-slate-100"
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setWeekOffset(weekOffset + 1)}
                            className="p-2 border rounded-lg hover:bg-slate-100"
                            disabled={weekOffset >= 0}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Days Locked" value={`${summary.daysLocked}/7`} icon={Lock} color="green" />
                <StatCard title="Week Cost" value={`₹${(summary.totalCost / 1000).toFixed(0)}K`} icon={DollarSign} color="blue" />
                <StatCard title="Open Issues" value={summary.openIssues} icon={AlertTriangle} color="orange" />
                <StatCard title="Delayed Tasks" value={summary.delayedTasks} icon={Clock} color="red" />
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Day</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Workers</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Tasks</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Issues</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {weekData.map((day, idx) => {
                            const isToday = day.date.toDateString() === new Date().toDateString()
                            const isFuture = day.date > new Date()

                            return (
                                <tr
                                    key={idx}
                                    className={`${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${isFuture ? 'opacity-50' : ''}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {day.date.toLocaleDateString('en-IN', { weekday: 'short' })}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {day.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                            {isToday && (
                                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Today</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {isFuture ? (
                                            <span className="text-slate-400">-</span>
                                        ) : day.isLocked ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                                <Lock size={14} /> Locked
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-orange-600">
                                                <Unlock size={14} /> Open
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {day.isEmpty ? '-' : (
                                            <span>
                                                {(day.attendance?.skilledCount || 0) + (day.attendance?.unskilledCount || 0)}
                                                <span className="text-xs text-slate-500 ml-1">
                                                    ({day.attendance?.skilledCount || 0}S + {day.attendance?.unskilledCount || 0}U)
                                                </span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {day.isEmpty ? '-' : (
                                            <span>
                                                {day.tasks?.completed || 0}/{day.tasks?.total || 0}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {day.isEmpty ? '-' : (
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <span className="text-red-600">+{day.issues?.raised || 0}</span>
                                                <span className="text-emerald-600">-{day.issues?.resolved || 0}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {day.isEmpty ? '-' : `₹${(day.totalDayCost || 0).toLocaleString()}`}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-900/50 font-semibold">
                        <tr>
                            <td colSpan={5} className="px-4 py-3 text-right">Week Total</td>
                            <td className="px-4 py-3 text-right text-blue-600">₹{summary.totalCost.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
