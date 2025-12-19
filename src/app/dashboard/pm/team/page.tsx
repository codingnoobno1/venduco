// PM Team Management Page - Real Data from MongoDB
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Users,
    UserPlus,
    Phone,
    Building2,
    RefreshCw,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function PMTeamPage() {
    const router = useRouter()
    const [teamMembers, setTeamMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchTeam()
    }, [])

    async function fetchTeam() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/team', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setTeamMembers(data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch team:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    function handleRefresh() {
        setRefreshing(true)
        fetchTeam()
    }

    const stats = {
        total: teamMembers.length,
        supervisors: teamMembers.filter(m => m.role === 'SUPERVISOR').length,
        vendors: teamMembers.filter(m => m.role === 'VENDOR').length,
        active: teamMembers.filter(m => m.status === 'ACTIVE' || m.status === 'APPROVED').length,
    }

    const filteredMembers = filter === 'all'
        ? teamMembers
        : teamMembers.filter(m => m.role === filter)

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Management</h1>
                    <p className="text-slate-500 mt-1">Supervisors and vendors across your projects</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Invite Member
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Team" value={stats.total} icon={Users} color="blue" />
                <StatCard title="Supervisors" value={stats.supervisors} icon={Users} color="green" />
                <StatCard title="Vendors" value={stats.vendors} icon={Building2} color="orange" />
                <StatCard title="Active" value={stats.active} icon={Users} color="purple" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'SUPERVISOR', label: 'Supervisors' },
                    { key: 'VENDOR', label: 'Vendors' },
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

            {/* Team Table */}
            {filteredMembers.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No team members yet"
                    description="Invite supervisors and vendors to join your projects to see them here."
                    action={{
                        label: 'Invite Member',
                        onClick: () => { }
                    }}
                />
            ) : (
                <DataTable
                    columns={[
                        {
                            key: 'name',
                            label: 'Name',
                            sortable: true,
                            render: (val, row) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {val?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-medium">{val || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">{row.email || '-'}</p>
                                    </div>
                                </div>
                            )
                        },
                        { key: 'role', label: 'Role', render: (val) => <StatusBadge status={val || 'MEMBER'} /> },
                        { key: 'projectName', label: 'Project', sortable: true, render: (val) => val || '-' },
                        {
                            key: 'phone',
                            label: 'Contact',
                            render: (val) => val ? (
                                <div className="flex items-center gap-1 text-sm">
                                    <Phone size={12} className="text-slate-400" />
                                    {val}
                                </div>
                            ) : '-'
                        },
                        { key: 'company', label: 'Company', render: (val) => val || '-' },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val || 'PENDING'} /> },
                    ]}
                    data={filteredMembers}
                    searchable={true}
                    searchKeys={['name', 'email', 'projectName', 'company']}
                    pageSize={10}
                    emptyMessage="No team members found"
                />
            )}
        </div>
    )
}
