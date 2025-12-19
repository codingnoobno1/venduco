// Vendor Rental Requests Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Calendar,
    MapPin,
    RefreshCw,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorRentalsPage() {
    const [rentals, setRentals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchRentals()
    }, [])

    async function fetchRentals() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/machinerentals?view=vendor-requests', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setRentals(data.data || [])
        } catch (error) {
            console.error('Failed to fetch rentals:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    async function handleAction(rentalId: string, action: 'approve' | 'reject') {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/machinerentals/${rentalId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            })
            fetchRentals()
        } catch (error) {
            console.error(`Failed to ${action} rental:`, error)
        }
    }

    function handleRefresh() {
        setRefreshing(true)
        fetchRentals()
    }

    const filteredRentals = filter === 'all'
        ? rentals
        : rentals.filter(r => r.status === filter)

    const stats = {
        total: rentals.length,
        pending: rentals.filter(r => r.status === 'REQUESTED').length,
        approved: rentals.filter(r => r.status === 'APPROVED').length,
        active: rentals.filter(r => r.status === 'IN_USE').length,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rental Requests</h1>
                    <p className="text-slate-500 mt-1">Manage incoming rental requests for your machines</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Requests" value={stats.total} icon={Truck} color="blue" />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} color="green" />
                <StatCard title="Active Rentals" value={stats.active} icon={Truck} color="purple" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'REQUESTED', label: 'Pending' },
                    { key: 'APPROVED', label: 'Approved' },
                    { key: 'IN_USE', label: 'Active' },
                    { key: 'COMPLETED', label: 'Completed' },
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

            {/* Rentals Table */}
            {filteredRentals.length === 0 ? (
                <EmptyState
                    icon={Truck}
                    title="No rental requests"
                    description={filter === 'all' ? 'List your machines for rent to receive requests' : 'No requests in this category'}
                />
            ) : (
                <DataTable
                    columns={[
                        { key: 'machineCode', label: 'Machine', sortable: true },
                        { key: 'machineType', label: 'Type', render: (val) => val?.replace(/_/g, ' ') || '-' },
                        { key: 'requesterName', label: 'Requested By', sortable: true, render: (val) => val || 'Unknown' },
                        { key: 'projectName', label: 'Project', render: (val) => val || '-' },
                        { key: 'requestedDays', label: 'Duration', render: (val) => `${val || 0} days` },
                        { key: 'dailyRate', label: 'Rate', render: (val) => `₹${(val || 0).toLocaleString()}/day` },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        {
                            key: 'actions',
                            label: 'Actions',
                            render: (_, row) => row.status === 'REQUESTED' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(row._id, 'approve')}
                                        className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleAction(row._id, 'reject')}
                                        className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            )
                        }
                    ]}
                    data={filteredRentals}
                    searchable={true}
                    searchKeys={['machineCode', 'requesterName', 'projectName']}
                    pageSize={10}
                />
            )}
        </div>
    )
}
