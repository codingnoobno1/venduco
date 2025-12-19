// Supervisor Attendance Page - Mark daily labour
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    HardHat,
    Calendar,
    Clock,
    CheckCircle2,
    RefreshCw,
    Save,
    History,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function SupervisorAttendancePage() {
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [history, setHistory] = useState<any[]>([])

    const [attendance, setAttendance] = useState({
        skilledCount: 0,
        unskilledCount: 0,
        shift: 'DAY',
        notes: '',
    })

    const [todayMarked, setTodayMarked] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            fetchAttendanceHistory()
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

    async function fetchAttendanceHistory() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/attendance/project/${selectedProject}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            const records = data.data || []
            setHistory(records)

            // Check if today is already marked
            const today = new Date().toDateString()
            const todayRecord = records.find((r: any) =>
                new Date(r.date).toDateString() === today
            )
            if (todayRecord) {
                setTodayMarked(true)
                setAttendance({
                    skilledCount: todayRecord.skilledCount,
                    unskilledCount: todayRecord.unskilledCount,
                    shift: todayRecord.shift,
                    notes: todayRecord.notes || '',
                })
            } else {
                setTodayMarked(false)
                setAttendance({ skilledCount: 0, unskilledCount: 0, shift: 'DAY', notes: '' })
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const token = localStorage.getItem('token')

        try {
            await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: selectedProject,
                    ...attendance
                })
            })
            setTodayMarked(true)
            fetchAttendanceHistory()
        } catch (error) {
            console.error('Failed to submit attendance:', error)
        } finally {
            setSaving(false)
        }
    }

    const totalToday = attendance.skilledCount + attendance.unskilledCount
    const todayDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
                    <p className="text-slate-500 mt-1">{todayDate}</p>
                </div>
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                >
                    {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Today's Status */}
            {todayMarked && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-600" size={24} />
                    <div>
                        <p className="font-medium text-emerald-700 dark:text-emerald-300">Today's attendance marked</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            {attendance.skilledCount} skilled + {attendance.unskilledCount} unskilled = {totalToday} total
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mark Attendance Form */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <HardHat className="text-orange-500" />
                        {todayMarked ? 'Update' : 'Mark'} Today's Attendance
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Skilled Workers</label>
                                <input
                                    type="number"
                                    value={attendance.skilledCount}
                                    onChange={(e) => setAttendance({ ...attendance, skilledCount: parseInt(e.target.value) || 0 })}
                                    min={0}
                                    className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 text-lg font-semibold text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Unskilled Workers</label>
                                <input
                                    type="number"
                                    value={attendance.unskilledCount}
                                    onChange={(e) => setAttendance({ ...attendance, unskilledCount: parseInt(e.target.value) || 0 })}
                                    min={0}
                                    className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 text-lg font-semibold text-center"
                                />
                            </div>
                        </div>

                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-sm text-slate-500">Total Workers</p>
                            <p className="text-4xl font-bold text-blue-600">{totalToday}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Shift</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['DAY', 'NIGHT', 'DOUBLE'].map((shift) => (
                                    <button
                                        key={shift}
                                        type="button"
                                        onClick={() => setAttendance({ ...attendance, shift })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${attendance.shift === shift
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {shift === 'DAY' ? '☀️ Day' : shift === 'NIGHT' ? '🌙 Night' : '⏰ Double'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                            <textarea
                                value={attendance.notes}
                                onChange={(e) => setAttendance({ ...attendance, notes: e.target.value })}
                                rows={2}
                                placeholder="Any remarks..."
                                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-900"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={saving || (attendance.skilledCount === 0 && attendance.unskilledCount === 0)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            ) : (
                                <Save size={20} />
                            )}
                            {todayMarked ? 'Update' : 'Submit'} Attendance
                        </motion.button>
                    </form>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History className="text-purple-500" />
                        Recent History
                    </h2>

                    {history.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No attendance records</p>
                    ) : (
                        <div className="space-y-3">
                            {history.slice(0, 7).map((record, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </p>
                                        <p className="text-xs text-slate-500">{record.shift} shift</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600">{record.skilledCount + record.unskilledCount}</p>
                                        <p className="text-xs text-slate-500">
                                            {record.skilledCount}S + {record.unskilledCount}U
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
