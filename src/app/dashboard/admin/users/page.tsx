// Admin Users Management Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    UserPlus,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    RefreshCw,
    Eye,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setUsers(data.data || [])
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    async function handleApprove(userId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/admin/users/${userId}/approve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchUsers()
        } catch (error) {
            console.error('Failed to approve user:', error)
        }
    }

    async function handleReject(userId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/admin/users/${userId}/reject`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchUsers()
        } catch (error) {
            console.error('Failed to reject user:', error)
        }
    }

    const filteredUsers = filter === 'all'
        ? users
        : filter === 'pending'
            ? users.filter(u => u.registrationStatus === 'PENDING_VERIFICATION')
            : users.filter(u => u.role === filter)

    const stats = {
        total: users.length,
        pending: users.filter(u => u.registrationStatus === 'PENDING_VERIFICATION').length,
        vendors: users.filter(u => u.role === 'VENDOR').length,
        supervisors: users.filter(u => u.role === 'SUPERVISOR').length,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage all users and verify new registrations</p>
                </div>
                <button
                    onClick={() => { setRefreshing(true); fetchUsers(); }}
                    disabled={refreshing}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.total} icon={Users} color="blue" />
                <StatCard title="Pending Verification" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="Vendors" value={stats.vendors} icon={Users} color="green" />
                <StatCard title="Supervisors" value={stats.supervisors} icon={Users} color="purple" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'VENDOR', label: 'Vendors' },
                    { key: 'SUPERVISOR', label: 'Supervisors' },
                    { key: 'PM', label: 'PMs' },
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

            {/* Users Table */}
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
                    { key: 'role', label: 'Role', render: (val) => <StatusBadge status={val || 'USER'} /> },
                    { key: 'phone', label: 'Phone', render: (val) => val || '-' },
                    { key: 'company', label: 'Company', render: (val) => val || '-' },
                    { key: 'registrationStatus', label: 'Status', render: (val) => <StatusBadge status={val || 'ACTIVE'} /> },
                    { key: 'createdAt', label: 'Joined', render: (val) => new Date(val).toLocaleDateString() },
                    {
                        key: 'actions',
                        label: 'Actions',
                        render: (_, row) => row.registrationStatus === 'PENDING_VERIFICATION' ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(row._id)}
                                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                                    title="Approve"
                                >
                                    <CheckCircle2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleReject(row._id)}
                                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    title="Reject"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        ) : (
                            <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                                <Eye size={16} />
                            </button>
                        )
                    }
                ]}
                data={filteredUsers}
                searchable={true}
                searchKeys={['name', 'email', 'company']}
                pageSize={10}
                emptyMessage="No users found"
            />
        </div>
    )
}
