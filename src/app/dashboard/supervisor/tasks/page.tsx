// Supervisor Task List Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle2,
    Clock,
    Calendar,
    RefreshCw,
    AlertTriangle,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function SupervisorTasksPage() {
    const [loading, setLoading] = useState(true)
    const [tasks, setTasks] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('all')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            // Fetch assigned projects
            const projectsRes = await fetch('/api/projects/assigned', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])

            // Fetch assigned tasks
            const tasksRes = await fetch('/api/tasks/assigned', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const tasksData = await tasksRes.json()
            setTasks(tasksData.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function updateProgress(taskId: string, progress: number) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/tasks/${taskId}/progress`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ progress })
            })
            fetchData()
        } catch (error) {
            console.error('Failed to update progress:', error)
        }
    }

    const filteredTasks = tasks.filter(t => {
        if (selectedProject !== 'all' && t.projectId !== selectedProject) return false
        if (filter === 'TODO') return t.status === 'TODO'
        if (filter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS'
        if (filter === 'COMPLETED') return t.progress >= 100
        if (filter === 'OVERDUE') return t.dueDate && new Date(t.dueDate) < new Date() && t.progress < 100
        return true
    })

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.progress >= 100).length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.progress < 100).length,
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
                    <p className="text-slate-500 mt-1">Tasks assigned to you</p>
                </div>
                <button onClick={fetchData} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Tasks" value={stats.total} icon={Calendar} color="blue" />
                <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
                <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="orange" />
                <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="red" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
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

                <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border">
                    {['all', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {f === 'all' ? 'All' : f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="No tasks"
                    description="No tasks assigned to you"
                />
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.progress < 100

                        return (
                            <motion.div
                                key={task._id}
                                layout
                                className={`bg-white dark:bg-slate-800 rounded-xl p-4 border ${isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{task.title}</h3>
                                            <StatusBadge status={task.priority} />
                                            {isOverdue && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">{task.projectName}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-600">{task.progress || 0}%</span>
                                </div>

                                {task.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        {task.description}
                                    </p>
                                )}

                                <ProgressBar value={task.progress || 0} color={task.progress >= 100 ? 'green' : 'blue'} />

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex gap-2">
                                        {[0, 25, 50, 75, 100].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => updateProgress(task._id, val)}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${task.progress === val
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {val}%
                                            </button>
                                        ))}
                                    </div>
                                    {task.dueDate && (
                                        <span className="text-sm text-slate-500 flex items-center gap-1">
                                            <Calendar size={14} />
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
