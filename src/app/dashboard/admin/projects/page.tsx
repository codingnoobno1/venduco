// Admin Projects Overview Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    FolderKanban,
    TrendingUp,
    DollarSign,
    MapPin,
    Calendar,
    RefreshCw,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'

export default function AdminProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setProjects(data.data || [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.status === filter)

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'ACTIVE').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        avgProgress: projects.length > 0
            ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
            : 0,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Projects</h1>
                    <p className="text-slate-500 mt-1">Platform-wide project overview</p>
                </div>
                <button onClick={fetchProjects} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Projects" value={stats.total} icon={FolderKanban} color="blue" />
                <StatCard title="Active" value={stats.active} icon={TrendingUp} color="green" />
                <StatCard title="Total Budget" value={`₹${(stats.totalBudget / 10000000).toFixed(1)}Cr`} icon={DollarSign} color="purple" />
                <StatCard title="Avg Progress" value={`${stats.avgProgress.toFixed(0)}%`} icon={TrendingUp} color="orange" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {['all', 'PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD'].map(key => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === key ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {key === 'all' ? 'All' : key.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Projects Table */}
            <DataTable
                columns={[
                    { key: 'projectCode', label: 'Code', sortable: true },
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'location', label: 'Location', render: (val) => val || '-' },
                    { key: 'pmName', label: 'PM', render: (val) => val || '-' },
                    { key: 'budget', label: 'Budget', sortable: true, render: (val) => `₹${((val || 0) / 100000).toFixed(1)}L` },
                    {
                        key: 'progress',
                        label: 'Progress',
                        render: (val) => (
                            <div className="w-24">
                                <ProgressBar value={val || 0} size="sm" />
                            </div>
                        )
                    },
                    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                ]}
                data={filteredProjects}
                onRowClick={(row) => router.push(`/dashboard/admin/projects/${row._id}`)}
                searchable={true}
                searchKeys={['name', 'projectCode', 'location', 'pmName']}
                pageSize={10}
            />
        </div>
    )
}
