// Vendor Fleet Management Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Plus,
    Search,
    Filter,
    Grid3X3,
    List,
    Truck,
    Wrench,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react'
import { MachineCard } from '@/components/dashboard/shared/MachineCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorFleetPage() {
    const router = useRouter()
    const [machines, setMachines] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

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

    const filteredMachines = machines.filter(m => {
        const matchesFilter = filter === 'all' || m.status === filter
        const matchesSearch = m.machineCode?.toLowerCase().includes(search.toLowerCase()) ||
            m.machineType?.toLowerCase().includes(search.toLowerCase()) ||
            m.name?.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const stats = {
        total: machines.length,
        available: machines.filter(m => m.status === 'AVAILABLE').length,
        assigned: machines.filter(m => m.status === 'ASSIGNED').length,
        maintenance: machines.filter(m => m.status === 'MAINTENANCE').length,
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={6} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Fleet</h1>
                    <p className="text-slate-500 mt-1">{machines.length} machines in your fleet</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/vendor/fleet/new')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Machine
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Fleet" value={stats.total} icon={Truck} color="blue" />
                <StatCard title="Available" value={stats.available} icon={Truck} color="green" />
                <StatCard title="Assigned" value={stats.assigned} icon={Truck} color="orange" />
                <StatCard title="Maintenance" value={stats.maintenance} icon={Wrench} color="red" />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'AVAILABLE', label: 'Available' },
                        { key: 'ASSIGNED', label: 'Assigned' },
                        { key: 'MAINTENANCE', label: 'Maintenance' },
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

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search machines..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm w-64"
                        />
                    </div>
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : ''}`}
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : ''}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Machines Display */}
            {filteredMachines.length === 0 ? (
                <EmptyState
                    icon={Truck}
                    title="No machines found"
                    description={search ? 'Try a different search term' : 'Add your first machine to get started'}
                    action={{
                        label: 'Add Machine',
                        onClick: () => router.push('/dashboard/vendor/fleet/new')
                    }}
                />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMachines.map((machine) => (
                        <MachineCard
                            key={machine._id}
                            machine={machine}
                            onClick={() => router.push(`/dashboard/vendor/fleet/${machine._id}`)}
                        />
                    ))}
                </div>
            ) : (
                <DataTable
                    columns={[
                        { key: 'machineCode', label: 'Code', sortable: true },
                        { key: 'machineType', label: 'Type', render: (val) => val?.replace(/_/g, ' ') },
                        { key: 'manufacturer', label: 'Manufacturer' },
                        { key: 'model', label: 'Model' },
                        { key: 'location', label: 'Location' },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                    ]}
                    data={filteredMachines}
                    onRowClick={(row) => router.push(`/dashboard/vendor/fleet/${row._id}`)}
                    pageSize={10}
                />
            )}
        </div>
    )
}
