// Supervisor Project Summary Page - Quick overview of assigned projects
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FolderOpen,
    CheckCircle2,
    Clock,
    Users,
    Calendar,
    TrendingUp,
    RefreshCw,
    ExternalLink,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import Link from 'next/link'

export default function SupervisorSummaryPage() {
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState<any[]>([])
    const [todayStats, setTodayStats] = useState({
        tasksCompleted: 0,
        attendanceMarked: 0,
        issuesRaised: 0,
        hoursWorked: 0,
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/assigned', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setProjects(data.data || [])

            // Mock today's stats
            setTodayStats({
                tasksCompleted: Math.floor(Math.random() * 5),
                attendanceMarked: Math.random() > 0.5 ? 1 : 0,
                issuesRaised: Math.floor(Math.random() * 3),
                hoursWorked: 6 + Math.random() * 4,
            })
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Summary</h1>
                    <p className="text-slate-500 mt-1">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button onClick={fetchData} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Tasks Done Today" value={todayStats.tasksCompleted} icon={CheckCircle2} color="green" />
                <StatCard
                    title="Attendance"
                    value={todayStats.attendanceMarked ? '✓ Marked' : 'Pending'}
                    icon={Users}
                    color={todayStats.attendanceMarked ? 'green' : 'orange'}
                />
                <StatCard title="Issues Raised" value={todayStats.issuesRaised} icon={Clock} color="blue" />
                <StatCard title="Hours Today" value={`${todayStats.hoursWorked.toFixed(1)}h`} icon={TrendingUp} color="purple" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/supervisor/daily-plan">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white text-center cursor-pointer"
                    >
                        <Calendar size={32} className="mx-auto mb-2" />
                        <p className="font-medium">Today's Plan</p>
                    </motion.div>
                </Link>
                <Link href="/dashboard/supervisor/attendance">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white text-center cursor-pointer"
                    >
                        <Users size={32} className="mx-auto mb-2" />
                        <p className="font-medium">Mark Attendance</p>
                    </motion.div>
                </Link>
                <Link href="/dashboard/supervisor/tasks">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl text-white text-center cursor-pointer"
                    >
                        <CheckCircle2 size={32} className="mx-auto mb-2" />
                        <p className="font-medium">My Tasks</p>
                    </motion.div>
                </Link>
                <Link href="/dashboard/supervisor/reports">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white text-center cursor-pointer"
                    >
                        <FolderOpen size={32} className="mx-auto mb-2" />
                        <p className="font-medium">Reports</p>
                    </motion.div>
                </Link>
            </div>

            {/* Assigned Projects */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Assigned Projects ({projects.length})</h3>
                </div>
                <div className="divide-y">
                    {projects.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <FolderOpen size={48} className="mx-auto mb-4 text-slate-400" />
                            <p>No projects assigned</p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <Link
                                key={project._id}
                                href={`/dashboard/supervisor/projects/${project._id}`}
                                className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{project.name}</h4>
                                            <StatusBadge status={project.status} />
                                        </div>
                                        <p className="text-sm text-slate-500">{project.projectCode}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Progress</p>
                                            <p className="font-bold text-blue-600">{project.progress || 0}%</p>
                                        </div>
                                        <ExternalLink size={18} className="text-slate-400" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <ProgressBar value={project.progress || 0} size="sm" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
