// PM Task Management Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    CheckCircle2,
    Clock,
    User,
    Calendar,
    RefreshCw,
    Filter,
    MoreVertical,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function PMTasksPage() {
    const [loading, setLoading] = useState(true)
    const [tasks, setTasks] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('all')
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [teamMembers, setTeamMembers] = useState<any[]>([])

    const [newTask, setNewTask] = useState({
        projectId: '',
        title: '',
        description: '',
        assignedTo: '',
        priority: 'NORMAL',
        dueDate: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedProject !== 'all') {
            fetchTeamMembers(selectedProject)
        }
    }, [selectedProject])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            // Fetch projects
            const projectsRes = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])

            // Fetch all tasks
            const tasksRes = await fetch('/api/tasks', {
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

    async function fetchTeamMembers(projectId: string) {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setTeamMembers(data.data || [])
        } catch (error) {
            console.error('Failed to fetch team:', error)
        }
    }

    async function createTask(e: React.FormEvent) {
        e.preventDefault()
        const token = localStorage.getItem('token')

        try {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            })
            setShowModal(false)
            setNewTask({ projectId: '', title: '', description: '', assignedTo: '', priority: 'NORMAL', dueDate: '' })
            fetchData()
        } catch (error) {
            console.error('Failed to create task:', error)
        }
    }

    const filteredTasks = tasks.filter(t => {
        if (selectedProject !== 'all' && t.projectId !== selectedProject) return false
        if (filter === 'TODO') return t.status === 'TODO'
        if (filter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS'
        if (filter === 'COMPLETED') return t.status === 'COMPLETED' || t.progress >= 100
        return true
    })

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'TODO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        completed: tasks.filter(t => t.status === 'COMPLETED' || t.progress >= 100).length,
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Management</h1>
                    <p className="text-slate-500 mt-1">Assign and track tasks across projects</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Task
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Tasks" value={stats.total} icon={Calendar} color="blue" />
                <StatCard title="To Do" value={stats.todo} icon={Clock} color="slate" />
                <StatCard title="In Progress" value={stats.inProgress} icon={RefreshCw} color="orange" />
                <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
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
                    {['all', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map(f => (
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
                    title="No tasks found"
                    description="Create a new task to get started"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                        <motion.div
                            key={task._id}
                            whileHover={{ y: -2 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 border"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-medium line-clamp-1">{task.title}</h3>
                                    <p className="text-xs text-slate-500">{task.projectName || 'Project'}</p>
                                </div>
                                <StatusBadge status={task.priority} />
                            </div>

                            {task.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                    {task.description}
                                </p>
                            )}

                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Progress</span>
                                    <span className="font-medium">{task.progress || 0}%</span>
                                </div>
                                <ProgressBar value={task.progress || 0} color={task.progress >= 100 ? 'green' : 'blue'} />
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <User size={12} />
                                    {task.assigneeName || 'Unassigned'}
                                </div>
                                {task.dueDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Create Task</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <form onSubmit={createTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Project *</label>
                                <select
                                    value={newTask.projectId}
                                    onChange={(e) => {
                                        setNewTask({ ...newTask, projectId: e.target.value })
                                        fetchTeamMembers(e.target.value)
                                    }}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Task Title *</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                    placeholder="e.g., Complete foundation work"
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Assign To</label>
                                    <select
                                        value={newTask.assignedTo}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="">Select Member</option>
                                        {teamMembers.map(m => (
                                            <option key={m._id || m.userId} value={m.userId}>{m.name} ({m.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
