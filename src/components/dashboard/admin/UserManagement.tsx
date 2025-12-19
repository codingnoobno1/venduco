// User Management Component - For Admin
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Eye,
    Download,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

interface UserManagementProps {
    filterStatus?: string
}

export function UserManagement({ filterStatus }: UserManagementProps) {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(filterStatus || 'all')

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
        }
    }

    async function handleAction(userId: string, action: 'approve' | 'reject') {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            })
            fetchUsers()
        } catch (error) {
            console.error(`Failed to ${action} user:`, error)
        }
    }

    const filteredUsers = filter === 'all'
        ? users
        : users.filter(u => {
            if (filter === 'pending') return u.registrationStatus === 'PENDING_VERIFICATION'
            if (filter === 'approved') return u.registrationStatus === 'APPROVED'
            if (filter === 'rejected') return u.registrationStatus === 'REJECTED'
            return true
        })

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All', count: users.length },
                    { key: 'pending', label: 'Pending', count: users.filter(u => u.registrationStatus === 'PENDING_VERIFICATION').length },
                    { key: 'approved', label: 'Approved', count: users.filter(u => u.registrationStatus === 'APPROVED').length },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {tab.label} ({tab.count})
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
                                    <p className="font-medium">{val}</p>
                                    <p className="text-xs text-slate-500">{row.email}</p>
                                </div>
                            </div>
                        )
                    },
                    {
                        key: 'requestedRole',
                        label: 'Role',
                        render: (val) => <StatusBadge status={val || 'VENDOR'} />
                    },
                    {
                        key: 'phone',
                        label: 'Phone',
                        render: (val) => val || '-'
                    },
                    {
                        key: 'registrationStatus',
                        label: 'Status',
                        render: (val) => <StatusBadge status={val === 'PENDING_VERIFICATION' ? 'PENDING' : val} />
                    },
                    {
                        key: 'createdAt',
                        label: 'Registered',
                        render: (val) => new Date(val).toLocaleDateString()
                    },
                    {
                        key: 'actions',
                        label: 'Actions',
                        render: (_, row) => row.registrationStatus === 'PENDING_VERIFICATION' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(row._id, 'approve')}
                                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                                    title="Approve"
                                >
                                    <CheckCircle2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleAction(row._id, 'reject')}
                                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    title="Reject"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        )
                    }
                ]}
                data={filteredUsers}
                searchable={true}
                searchKeys={['name', 'email', 'phone']}
                pageSize={10}
                emptyMessage="No users found"
            />
        </div>
    )
}
