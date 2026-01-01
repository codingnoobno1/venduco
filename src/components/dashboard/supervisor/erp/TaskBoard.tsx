"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Layout,
    Play,
    CheckCircle2,
    AlertCircle,
    Search,
    Truck,
    ClipboardList,
    MoreHorizontal
} from 'lucide-react'

interface TaskBoardProps {
    projectId: string
}

export function TaskBoard({ projectId }: TaskBoardProps) {
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')

    const columns = [
        { id: 'PLANNED', label: 'Planned / Backlog', color: 'slate' },
        { id: 'ACTIVE', label: 'In Execution', color: 'blue' },
        { id: 'INSPECTION', label: 'In Inspection', color: 'amber' },
        { id: 'REWORK', label: 'Rework Needed', color: 'red' },
        { id: 'COMPLETED', label: 'Completed', color: 'emerald' },
    ]

    useEffect(() => {
        fetchTasks()
    }, [projectId])

    async function fetchTasks() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setTasks(data.data)
        } catch (err) {
            console.error('Fetch tasks error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(taskId: string, newStatus: string) {
        const token = localStorage.getItem('token')
        try {
            // Need PUT API for status change
            // await fetch(...)
            alert(`Transitioning to ${newStatus}... API call pending implementation.`)
            fetchTasks()
        } catch (err) {
            console.error('Update status error:', err)
        }
    }

    const filteredTasks = tasks.filter(t =>
        t.taskCode.toLowerCase().includes(filter.toLowerCase()) ||
        t.department.toLowerCase().includes(filter.toLowerCase())
    )

    if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        placeholder="Search by code, dept (CEN, GEO...)"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                        Supervisor Execution Terminal
                    </span>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar lg:grid lg:grid-cols-5 lg:overflow-visible">
                {columns.map(col => (
                    <div key={col.id} className="min-w-[280px] space-y-3">
                        <div className="flex items-center justify-between px-2 mb-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-[0_0_8px_rgba(var(--tw-color-${col.color}-500),0.5)]`} />
                                {col.label}
                            </h4>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">
                                {filteredTasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>

                        <div className="space-y-3 min-h-[400px]">
                            {filteredTasks.filter(t => t.status === col.id).map(task => (
                                <motion.div
                                    layoutId={task._id}
                                    key={task._id}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300`}>
                                            {task.department}
                                        </span>
                                        <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>

                                    <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{task.taskCode}</h5>
                                    <p className="text-[10px] text-slate-500 mb-3 truncate">Sec: {task.sectionId?.name || 'N/A'}</p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-500">Physical Progress</span>
                                            <span className="font-bold">{task.metadata?.quantityDone || 0} / {task.plannedQuantity} {task.unit}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, ((task.metadata?.quantityDone || 0) / task.plannedQuantity) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                            <Truck size={12} />
                                            <span>{task.metadata?.machinesCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                            <ClipboardList size={12} />
                                            <span className={task.metadata?.inspectionCount > 0 ? 'text-emerald-500' : ''}>
                                                {task.metadata?.inspectionCount || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {col.id === 'PLANNED' && (
                                        <button
                                            onClick={() => updateStatus(task._id, 'ACTIVE')}
                                            className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Play size={10} fill="white" />
                                            START TASK
                                        </button>
                                    )}
                                    {col.id === 'ACTIVE' && (
                                        <button
                                            onClick={() => updateStatus(task._id, 'INSPECTION')}
                                            className="mt-3 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            <ClipboardList size={10} />
                                            REQUEST INSPECTION
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
