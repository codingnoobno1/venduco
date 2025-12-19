// Supervisor Single Project View
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Users,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Plus,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'
import { Timeline } from '@/components/dashboard/shared/Timeline'

export default function SupervisorProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        fetchData()
    }, [projectId])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            // Fetch project
            const projectRes = await fetch(`/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectData = await projectRes.json()
            if (projectData.success) {
                setProject(projectData.data)
            }

            // Fetch my reports for this project
            const reportsRes = await fetch(`/api/reports/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const reportsData = await reportsRes.json()
            setReports(reportsData.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Project not found</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-600">Go back</button>
            </div>
        )
    }

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'reports', label: `Reports (${reports.length})` },
        { key: 'tasks', label: 'My Tasks' },
    ]

    const recentReports = reports.slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {project.name}
                        </h1>
                        <StatusBadge status={project.status} size="md" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {project.location}
                        </span>
                        <span className="font-mono">{project.projectCode}</span>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/supervisor/reports/new')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    Submit Report
                </motion.button>
            </div>

            {/* Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Project Progress</h3>
                    <span className="text-2xl font-bold text-blue-600">{project.progress || 0}%</span>
                </div>
                <ProgressBar value={project.progress || 0} size="lg" color={project.progress >= 50 ? 'green' : 'blue'} />
                <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                    <div>
                        <p className="text-slate-500">Start</p>
                        <p className="font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Deadline</p>
                        <p className="font-medium text-orange-600">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Days Left</p>
                        <p className="font-medium">
                            {project.deadline ? Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Reports Submitted" value={reports.length} icon={FileText} color="blue" />
                <StatCard title="Pending Review" value={reports.filter(r => r.reviewStatus === 'PENDING').length} icon={Clock} color="orange" />
                <StatCard title="Reviewed" value={reports.filter(r => r.reviewStatus === 'REVIEWED').length} icon={CheckCircle2} color="green" />
                <StatCard title="Team Size" value={(project.vendorsCount || 0) + (project.supervisorsCount || 0)} icon={Users} color="purple" />
            </div>

            {/* Tabs */}
            <div className="border-b">
                <nav className="flex gap-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Details */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-4">Project Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Client</span>
                                <span className="font-medium">{project.clientName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Type</span>
                                <span className="font-medium">{project.projectType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Budget</span>
                                <span className="font-medium">₹{((project.budget || 0) / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">PM</span>
                                <span className="font-medium">{project.pmName || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Reports */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-4">Recent Reports</h3>
                        {recentReports.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No reports yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentReports.map(report => (
                                    <div key={report._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{new Date(report.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-slate-500">{report.workersPresent || 0} workers • {report.hoursWorked || 0}h</p>
                                        </div>
                                        <StatusBadge status={report.reviewStatus || 'PENDING'} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border">
                    {reports.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500">No reports submitted yet</p>
                            <button
                                onClick={() => router.push('/dashboard/supervisor/reports/new')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Submit First Report
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {reports.map(report => (
                                <div key={report._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{new Date(report.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                            <p className="text-sm text-slate-500">
                                                {report.workersPresent || 0} workers • {report.hoursWorked || 0} hours • {report.weatherCondition || 'N/A'}
                                            </p>
                                        </div>
                                        <StatusBadge status={report.reviewStatus || 'PENDING'} />
                                    </div>
                                    {report.workCompleted && (
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{report.workCompleted}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'tasks' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <p className="text-slate-500 text-center py-8">Task assignment coming soon</p>
                </div>
            )}
        </div>
    )
}
