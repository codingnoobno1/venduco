// Admin Reports Overview
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    CheckCircle2,
    Clock,
    RefreshCw,
    Eye,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchReports()
    }, [])

    async function fetchReports() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/reports/daily', {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Reports</h1>
                    <p className="text-slate-500 mt-1">Platform-wide daily reports overview</p>
                </div>
                <button onClick={fetchReports} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={stats.total} icon={FileText} color="blue" />
                <StatCard title="Today" value={stats.today} icon={FileText} color="purple" />
                <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="Reviewed" value={stats.reviewed} icon={CheckCircle2} color="green" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'PENDING', label: 'Pending' },
                    { key: 'REVIEWED', label: 'Reviewed' },
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

            {/* Reports Table */}
            <DataTable
                columns={[
                    { key: 'date', label: 'Date', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
                    { key: 'projectName', label: 'Project', sortable: true, render: (val) => val || '-' },
                    { key: 'supervisorName', label: 'Supervisor', render: (val) => val || '-' },
                    { key: 'workersPresent', label: 'Workers', sortable: true, render: (val) => val || 0 },
                    { key: 'hoursWorked', label: 'Hours', render: (val) => val || 0 },
                    { key: 'weatherCondition', label: 'Weather', render: (val) => val || '-' },
                    { key: 'workCompleted', label: 'Work Completed', render: (val) => (val?.substring(0, 50) || '-') + '...' },
                    { key: 'reviewStatus', label: 'Status', render: (val) => <StatusBadge status={val || 'PENDING'} /> },
                ]}
                data={filteredReports}
                searchable={true}
                searchKeys={['projectName', 'supervisorName', 'workCompleted']}
                pageSize={15}
            />
        </div>
    )
}
