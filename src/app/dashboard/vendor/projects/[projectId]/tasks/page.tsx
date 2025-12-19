// Vendor Project Tasks Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    Filter,
    Calendar,
} from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [tasks, setTasks] = useState<any[]>([])
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchTasks()
    }, [projectId])

    async function fetchTasks() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/tasks?projectId=${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setTasks(data.data || [])
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        return task.status === filter
    })

    const taskCounts = {
        pending: tasks.filter(t => t.status === 'PENDING').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
    }

    if (loading) return <LoadingSkeleton type="table" count={5} />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        My Tasks
                    </h1>
                    <p className="text-slate-500 mt-1">Tasks assigned to you in this project</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 flex items-center gap-3">
                    <Clock className="text-yellow-600" size={24} />
                    <div>
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="text-xl font-bold">{taskCounts.pending}</p>
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-blue-600" size={24} />
                    <div>
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-xl font-bold">{taskCounts.inProgress}</p>
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="text-green-600" size={24} />
                    <div>
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="text-xl font-bold">{taskCounts.completed}</p>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <EmptyState
                    icon={CheckCircle2}
                    title="No tasks"
                    description={filter === 'all' ? "No tasks assigned to you in this project" : `No ${filter.replace('_', ' ').toLowerCase()} tasks`}
                />
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{task.title}</h4>
                                            <StatusBadge status={task.status} />
                                        </div>
                                        {task.description && (
                                            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                                        )}
                                        {task.dueDate && (
                                            <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                                                <Calendar size={14} />
                                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    {task.priority && (
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${task.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                                                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
