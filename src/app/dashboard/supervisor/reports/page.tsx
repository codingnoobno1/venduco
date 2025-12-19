// Supervisor Daily Reports Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    FileText,
    Plus,
    CheckCircle2,
    Clock,
    Calendar,
    RefreshCw,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function SupervisorReportsPage() {
    const router = useRouter()
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchReports()
    }, [])

    async function fetchReports() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/reports/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setReports(data.data || [])
        } catch (error) {
            console.error('Failed to fetch reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.reviewStatus === filter)

    const stats = {
        total: reports.length,
        reviewed: reports.filter(r => r.reviewStatus === 'REVIEWED').length,
        pending: reports.filter(r => r.reviewStatus === 'PENDING').length,
        thisMonth: reports.filter(r => {
            const d = new Date(r.date)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Reports</h1>
                    <p className="text-slate-500 mt-1">Submit and track your daily progress reports</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/supervisor/reports/new')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Report
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={stats.total} icon={FileText} color="blue" />
                <StatCard title="Reviewed" value={stats.reviewed} icon={CheckCircle2} color="green" />
                <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="This Month" value={stats.thisMonth} icon={Calendar} color="purple" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All' },
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
                <EmptyState
                    icon={FileText}
                    title="No reports found"
                    description={filter === 'all' ? 'Submit your first daily report to track progress' : 'No reports in this category'}
                    action={{
                        label: 'Create Report',
                        onClick: () => router.push('/dashboard/supervisor/reports/new')
                    }}
                />
            ) : (
                <DataTable
                    columns={[
                        { key: 'date', label: 'Date', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
                        { key: 'projectName', label: 'Project', sortable: true, render: (val) => val || 'Unknown' },
                        { key: 'workersPresent', label: 'Workers', render: (val) => val || 0 },
                        { key: 'hoursWorked', label: 'Hours', render: (val) => `${val || 0}h` },
                        { key: 'weatherCondition', label: 'Weather' },
                        { key: 'reviewStatus', label: 'Status', render: (val) => <StatusBadge status={val || 'PENDING'} /> },
                    ]}
                    data={filteredReports}
                    onRowClick={(row) => router.push(`/dashboard/supervisor/reports/${row._id}`)}
                    searchable={true}
                    searchKeys={['projectName']}
                    pageSize={10}
                />
            )}
        </div>
    )
}
