// Supervisor Daily Plan - WhatsApp Replacement
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    CheckCircle2,
    Clock,
    Truck,
    Package,
    AlertTriangle,
    Play,
    Pause,
    RefreshCw,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function SupervisorDailyPlanPage() {
    const [tasks, setTasks] = useState<any[]>([])
    const [machines, setMachines] = useState<any[]>([])
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState<string>('')
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            fetchDailyPlan()
        }
    }, [selectedProject])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/assigned', {
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

    async function fetchDailyPlan() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/daily-plan/today?projectId=${selectedProject}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setTasks(data.tasks || [])
            setMachines(data.machines || [])
            setMaterials(data.materials || [])
        } catch (error) {
            console.error('Failed to fetch daily plan:', error)
        }
    }

    async function updateTaskProgress(taskId: string, progress: number) {
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
            fetchDailyPlan()
        } catch (error) {
            console.error('Failed to update progress:', error)
        }
    }

    const todayDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const stats = {
        totalTasks: tasks.length,
        completed: tasks.filter(t => t.progress >= 100).length,
        inProgress: tasks.filter(t => t.progress > 0 && t.progress < 100).length,
        machinesAllocated: machines.length,
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Today's Plan</h1>
                    <p className="text-slate-500 mt-1">{todayDate}</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    >
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                    <button onClick={fetchDailyPlan} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Today's Tasks" value={stats.totalTasks} icon={Calendar} color="blue" />
                <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
                <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="orange" />
                <StatCard title="Machines" value={stats.machinesAllocated} icon={Truck} color="purple" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tasks - 2 columns */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="text-blue-500" />
                        Tasks for Today
                    </h2>

                    {tasks.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No tasks assigned"
                            description="Tasks will appear here when assigned by PM"
                        />
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task._id}
                                    layout
                                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{task.title}</h3>
                                                <StatusBadge status={task.priority || 'NORMAL'} />
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">{task.progress || 0}%</span>
                                    </div>

                                    <ProgressBar value={task.progress || 0} color={task.progress >= 100 ? 'green' : 'blue'} />

                                    <div className="flex gap-2 mt-3">
                                        {[0, 25, 50, 75, 100].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => updateTaskProgress(task._id, val)}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${task.progress === val
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {val}%
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar - Machines & Materials */}
                <div className="space-y-6">
                    {/* Machines */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Truck className="text-purple-500" />
                            Machines Allocated
                        </h3>
                        {machines.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No machines allocated</p>
                        ) : (
                            <div className="space-y-3">
                                {machines.map((machine, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Truck size={20} className="text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{machine.machineCode}</p>
                                            <p className="text-xs text-slate-500">{machine.machineType?.replace(/_/g, ' ')}</p>
                                        </div>
                                        <StatusBadge status={machine.status || 'ACTIVE'} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Materials Expected */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Package className="text-orange-500" />
                            Materials Expected
                        </h3>
                        {materials.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No materials expected</p>
                        ) : (
                            <div className="space-y-3">
                                {materials.map((material, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{material.name}</p>
                                            <p className="text-xs text-slate-500">{material.quantity} {material.unit}</p>
                                        </div>
                                        <StatusBadge status={material.status || 'PENDING'} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
                        <h3 className="font-semibold mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <a href="/dashboard/supervisor/reports/new" className="block w-full px-4 py-2 bg-white/20 rounded-lg text-center hover:bg-white/30">
                                📝 Submit Daily Report
                            </a>
                            <a href="/dashboard/supervisor/attendance" className="block w-full px-4 py-2 bg-white/20 rounded-lg text-center hover:bg-white/30">
                                👷 Mark Attendance
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
