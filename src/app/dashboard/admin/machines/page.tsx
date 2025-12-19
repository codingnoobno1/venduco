// Admin Machines Overview
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Truck,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Search,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function AdminMachinesPage() {
    const router = useRouter()
    const [machines, setMachines] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchMachines()
    }, [])

    async function fetchMachines() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/machines', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setMachines(data.data || [])
        } catch (error) {
            console.error('Failed to fetch machines:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredMachines = filter === 'all'
        ? machines
        : machines.filter(m => m.status === filter)

    const stats = {
        total: machines.length,
        available: machines.filter(m => m.status === 'AVAILABLE').length,
        assigned: machines.filter(m => m.status === 'ASSIGNED').length,
        maintenance: machines.filter(m => m.status === 'UNDER_MAINTENANCE').length,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Machines</h1>
                    <p className="text-slate-500 mt-1">Platform-wide machine fleet overview</p>
                </div>
                <button onClick={fetchMachines} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Machines" value={stats.total} icon={Truck} color="blue" />
                <StatCard title="Available" value={stats.available} icon={CheckCircle2} color="green" />
                <StatCard title="Assigned" value={stats.assigned} icon={Truck} color="purple" />
                <StatCard title="Maintenance" value={stats.maintenance} icon={AlertTriangle} color="orange" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'AVAILABLE', label: 'Available' },
                    { key: 'ASSIGNED', label: 'Assigned' },
                    { key: 'UNDER_MAINTENANCE', label: 'Maintenance' },
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

            {/* Machines Table */}
            <DataTable
                columns={[
                    { key: 'machineCode', label: 'Code', sortable: true },
                    { key: 'machineType', label: 'Type', sortable: true, render: (val) => val?.replace(/_/g, ' ') || '-' },
                    { key: 'manufacturer', label: 'Manufacturer', render: (val) => val || '-' },
                    { key: 'model', label: 'Model', render: (val) => val || '-' },
                    { key: 'ownerName', label: 'Owner', render: (val) => val || '-' },
                    { key: 'location', label: 'Location', render: (val) => val || '-' },
                    { key: 'dailyRate', label: 'Daily Rate', sortable: true, render: (val) => `₹${(val || 0).toLocaleString()}` },
                    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                ]}
                data={filteredMachines}
                searchable={true}
                searchKeys={['machineCode', 'machineType', 'manufacturer', 'ownerName', 'location']}
                pageSize={15}
            />
        </div>
    )
}
