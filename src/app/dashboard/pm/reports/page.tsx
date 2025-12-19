// PM Reports Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, CheckCircle2, Clock, Eye, Download, Calendar } from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { StatCard } from '@/components/dashboard/shared/StatCard'

export default function PMReportsPage() {
    const router = useRouter()
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedReport, setSelectedReport] = useState<any>(null)

    useEffect(() => {
        fetchReports()
    }, [])

    async function fetchReports() {
        const token = localStorage.getItem('token')
        try {
            // Fetch projects first
            const projectsRes = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectsData = await projectsRes.json()
            const projects = projectsData.data || []

            // Fetch reports for each project
            const allReports: any[] = []
            for (const project of projects.slice(0, 5)) {
                try {
                    const reportsRes = await fetch(`/api/reports/project/${project._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    const reportsData = await reportsRes.json()
                    if (reportsData.data) {
                        reportsData.data.forEach((report: any) => {
                            allReports.push({
                                ...report,
                                projectName: project.name,
                                projectCode: project.projectCode,
                            })
                        })
                    }
                } catch (e) {
                    console.error('Failed to fetch reports for project:', project._id)
                }
            }

            setReports(allReports)
        } catch (error) {
            console.error('Failed to fetch reports:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleReview(reportId: string, status: string, feedback?: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reviewStatus: status, feedback })
            })
            setSelectedReport(null)
            fetchReports()
        } catch (error) {
            console.error('Failed to review report:', error)
        }
    }

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.reviewStatus === filter)

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.reviewStatus === 'PENDING').length,
        reviewed: reports.filter(r => r.reviewStatus === 'REVIEWED').length,
        today: reports.filter(r => {
            const today = new Date().toDateString()
            return new Date(r.date).toDateString() === today
        }).length,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Reports</h1>
                <p className="text-slate-500 mt-1">Review reports submitted by supervisors</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={stats.total} icon={FileText} color="blue" />
                <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="Reviewed" value={stats.reviewed} icon={CheckCircle2} color="green" />
                <StatCard title="Today" value={stats.today} icon={Calendar} color="purple" />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All Reports' },
                    { key: 'PENDING', label: 'Pending' },
                    { key: 'REVIEWED', label: 'Reviewed' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Reports Table */}
            {filteredReports.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <FileText size={48} className="mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No reports found
                    </h3>
                    <p className="text-slate-500">
                        {filter === 'all' ? 'No reports have been submitted yet' : `No ${filter.toLowerCase()} reports`}
                    </p>
                </div>
            ) : (
                <DataTable
                    columns={[
                        { key: 'projectCode', label: 'Project', sortable: true },
                        { key: 'supervisorName', label: 'Supervisor', sortable: true, render: (val) => val || 'Unknown' },
                        { key: 'date', label: 'Date', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
                        { key: 'workersPresent', label: 'Workers', render: (val) => val || 0 },
                        { key: 'hoursWorked', label: 'Hours', render: (val) => `${val || 0}h` },
                        { key: 'weatherCondition', label: 'Weather', render: (val) => val || '-' },
                        { key: 'reviewStatus', label: 'Status', render: (val) => <StatusBadge status={val || 'PENDING'} /> },
                        {
                            key: 'actions',
                            label: 'Actions',
                            render: (_, row) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedReport(row)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                                        title="View"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    {row.reviewStatus === 'PENDING' && (
                                        <button
                                            onClick={() => handleReview(row._id, 'REVIEWED')}
                                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                            title="Mark Reviewed"
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    data={filteredReports}
                    searchable={true}
                    searchKeys={['projectCode', 'supervisorName']}
                    pageSize={10}
                />
            )}

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Report Details</h2>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Project</p>
                                    <p className="font-medium">{selectedReport.projectName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Date</p>
                                    <p className="font-medium">{new Date(selectedReport.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Workers Present</p>
                                    <p className="font-medium">{selectedReport.workersPresent || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Hours Worked</p>
                                    <p className="font-medium">{selectedReport.hoursWorked || 0} hours</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Work Description</p>
                                <p className="mt-1 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    {selectedReport.workDescription || 'No description provided'}
                                </p>
                            </div>

                            {selectedReport.issues && (
                                <div>
                                    <p className="text-sm text-slate-500">Issues/Blockers</p>
                                    <p className="mt-1 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-700 dark:text-orange-300">
                                        {selectedReport.issues}
                                    </p>
                                </div>
                            )}

                            {selectedReport.reviewStatus === 'PENDING' && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handleReview(selectedReport._id, 'REVIEWED')}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                                    >
                                        Mark as Reviewed
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
