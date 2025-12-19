// PM Team Performance Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Star,
    CheckCircle2,
    Clock,
    TrendingUp,
    RefreshCw,
    Award,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

export default function PMTeamPerformancePage() {
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('all')
    const [teamStats, setTeamStats] = useState<any[]>([])
    const [summary, setSummary] = useState({
        totalMembers: 0,
        avgTaskCompletion: 0,
        avgAttendance: 0,
        topPerformer: '',
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        fetchTeamPerformance()
    }, [selectedProject])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setProjects(data.data || [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchTeamPerformance() {
        const token = localStorage.getItem('token')
        try {
            const url = selectedProject !== 'all'
                ? `/api/team/performance?projectId=${selectedProject}`
                : '/api/team/performance'
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setTeamStats(data.members || [])
            setSummary(data.summary || summary)
        } catch (error) {
            console.error('Failed to fetch team performance:', error)
            // Mock data
            setTeamStats([
                { name: 'Rajesh Kumar', role: 'SUPERVISOR', tasksCompleted: 12, tasksPending: 3, attendance: 95, rating: 4.5 },
                { name: 'Amit Singh', role: 'SUPERVISOR', tasksCompleted: 8, tasksPending: 5, attendance: 88, rating: 4.2 },
                { name: 'Priya Sharma', role: 'SUPERVISOR', tasksCompleted: 15, tasksPending: 1, attendance: 98, rating: 4.8 },
            ])
            setSummary({
                totalMembers: 3,
                avgTaskCompletion: 78,
                avgAttendance: 93.7,
                topPerformer: 'Priya Sharma',
            })
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Performance</h1>
                    <p className="text-slate-500 mt-1">Track supervisor and team productivity</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                    <button onClick={fetchTeamPerformance} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Team Members" value={summary.totalMembers} icon={Users} color="blue" />
                <StatCard title="Avg Completion" value={`${summary.avgTaskCompletion}%`} icon={CheckCircle2} color="green" />
                <StatCard title="Avg Attendance" value={`${summary.avgAttendance.toFixed(0)}%`} icon={Clock} color="orange" />
                <StatCard title="Top Performer" value={summary.topPerformer.split(' ')[0] || '-'} icon={Award} color="purple" />
            </div>

            {/* Top Performer Banner */}
            {summary.topPerformer && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <Award size={32} />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">🏆 Top Performer This Month</p>
                            <p className="text-2xl font-bold">{summary.topPerformer}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Team Members</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Role</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Tasks Done</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Pending</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Attendance</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {teamStats.map((member, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {member.name?.charAt(0) || '?'}
                                        </div>
                                        <span className="font-medium">{member.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <StatusBadge status={member.role} />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="text-lg font-bold text-green-600">{member.tasksCompleted}</span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`text-lg font-bold ${member.tasksPending > 5 ? 'text-red-600' : 'text-orange-500'}`}>
                                        {member.tasksPending}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <ProgressBar
                                            value={member.attendance || 0}
                                            color={member.attendance >= 90 ? 'green' : member.attendance >= 75 ? 'orange' : 'red'}
                                            size="sm"
                                        />
                                        <span className="text-sm font-medium w-12">{member.attendance}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                                        <span className="font-bold">{member.rating?.toFixed(1) || '-'}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
