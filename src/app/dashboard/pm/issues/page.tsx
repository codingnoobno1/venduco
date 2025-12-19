// PM Issues Tracker - Delays & Problems
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    MessageSquare,
    User,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function PMIssuesPage() {
    const router = useRouter()
    const [issues, setIssues] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [selectedIssue, setSelectedIssue] = useState<any>(null)

    const [newIssue, setNewIssue] = useState({
        projectId: '',
        title: '',
        description: '',
        priority: 'NORMAL',
        category: 'DELAY',
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            // Fetch projects
            const projectsRes = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])

            // Fetch issues
            const issuesRes = await fetch('/api/issues', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const issuesData = await issuesRes.json()
            setIssues(issuesData.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateIssue(e: React.FormEvent) {
        e.preventDefault()
        const token = localStorage.getItem('token')

        try {
            await fetch('/api/issues', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newIssue)
            })
            setShowModal(false)
            setNewIssue({ projectId: '', title: '', description: '', priority: 'NORMAL', category: 'DELAY' })
            fetchData()
        } catch (error) {
            console.error('Failed to create issue:', error)
        }
    }

    async function updateIssueStatus(issueId: string, status: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/issues/${issueId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            })
            fetchData()
            setSelectedIssue(null)
        } catch (error) {
            console.error('Failed to update issue:', error)
        }
    }

    const stats = {
        total: issues.length,
        open: issues.filter(i => i.status === 'OPEN').length,
        inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
        resolved: issues.filter(i => i.status === 'RESOLVED').length,
    }

    const filteredIssues = filter === 'all'
        ? issues
        : issues.filter(i => i.status === filter)

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Issues & Delays</h1>
                    <p className="text-slate-500 mt-1">Track and resolve project issues</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Report Issue
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Issues" value={stats.total} icon={AlertTriangle} color="blue" />
                <StatCard title="Open" value={stats.open} icon={AlertTriangle} color="red" />
                <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="orange" />
                <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="green" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'OPEN', label: 'Open' },
                    { key: 'IN_PROGRESS', label: 'In Progress' },
                    { key: 'RESOLVED', label: 'Resolved' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === tab.key ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
                <EmptyState
                    icon={AlertTriangle}
                    title="No issues found"
                    description="Great! No issues reported yet"
                />
            ) : (
                <div className="space-y-3">
                    {filteredIssues.map((issue) => (
                        <motion.div
                            key={issue._id}
                            whileHover={{ scale: 1.005 }}
                            onClick={() => setSelectedIssue(issue)}
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 border cursor-pointer hover:border-blue-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium">{issue.title}</h3>
                                        <StatusBadge status={issue.priority} />
                                        <StatusBadge status={issue.category} />
                                    </div>
                                    <p className="text-sm text-slate-500">{issue.projectName || 'Project'}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                                        {issue.description}
                                    </p>
                                </div>
                                <StatusBadge status={issue.status} size="md" />
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <User size={12} />
                                    {issue.reporterName || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(issue.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Issue Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Report Issue</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <form onSubmit={handleCreateIssue} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Project</label>
                                <select
                                    value={newIssue.projectId}
                                    onChange={(e) => setNewIssue({ ...newIssue, projectId: e.target.value })}
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
                                <label className="block text-sm font-medium mb-2">Issue Title *</label>
                                <input
                                    type="text"
                                    value={newIssue.title}
                                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                    required
                                    placeholder="Brief description of the issue"
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={newIssue.category}
                                        onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="DELAY">Delay</option>
                                        <option value="MATERIAL">Material Shortage</option>
                                        <option value="MACHINE">Machine Breakdown</option>
                                        <option value="LABOUR">Labour Issue</option>
                                        <option value="WEATHER">Weather</option>
                                        <option value="SAFETY">Safety</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Priority</label>
                                    <select
                                        value={newIssue.priority}
                                        onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
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
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={newIssue.description}
                                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                    rows={3}
                                    placeholder="Detailed description of the issue..."
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg">
                                    Report Issue
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Issue Detail Modal */}
            {selectedIssue && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Issue Details</h2>
                            <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold">{selectedIssue.title}</h3>
                                <StatusBadge status={selectedIssue.status} />
                            </div>
                            <div className="flex gap-2">
                                <StatusBadge status={selectedIssue.priority} />
                                <StatusBadge status={selectedIssue.category} />
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">{selectedIssue.description}</p>

                            <div className="border-t pt-4">
                                <p className="text-sm font-medium mb-3">Update Status</p>
                                <div className="flex gap-2">
                                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateIssueStatus(selectedIssue._id, status)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedIssue.status === status
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {status.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
