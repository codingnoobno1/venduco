// PM Rentals Marketplace Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck,
    Search,
    Filter,
    MapPin,
    DollarSign,
    Calendar,
    Phone,
    Mail,
    CheckCircle2,
    Clock,
} from 'lucide-react'
import { MachineCard } from '@/components/dashboard/shared/MachineCard'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { DataTable } from '@/components/dashboard/shared/DataTable'

export default function PMRentalsPage() {
    const router = useRouter()
    const [tab, setTab] = useState<'browse' | 'my-requests'>('browse')
    const [availableMachines, setAvailableMachines] = useState<any[]>([])
    const [myRequests, setMyRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedMachine, setSelectedMachine] = useState<any>(null)
    const [requestForm, setRequestForm] = useState({ projectId: '', days: 7 })
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch available machines for rent
            const availableRes = await fetch('/api/machinerentals?view=available', { headers })
            const availableData = await availableRes.json()
            setAvailableMachines(availableData.data || [])

            // Fetch my rental requests
            const requestsRes = await fetch('/api/machinerentals?view=my-requests', { headers })
            const requestsData = await requestsRes.json()
            setMyRequests(requestsData.data || [])

            // Fetch my projects for selection
            const projectsRes = await fetch('/api/projects/my', { headers })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleRequestRental() {
        if (!selectedMachine || !requestForm.projectId) return

        const token = localStorage.getItem('token')
        try {
            await fetch('/api/machinerentals', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'REQUEST_RENTAL',
                    rentalId: selectedMachine._id,
                    projectId: requestForm.projectId,
                    requestedDays: requestForm.days,
                })
            })
            setSelectedMachine(null)
            fetchData()
        } catch (error) {
            console.error('Failed to request rental:', error)
        }
    }

    const filteredMachines = availableMachines.filter(m =>
        m.machineCode?.toLowerCase().includes(search.toLowerCase()) ||
        m.machineType?.toLowerCase().includes(search.toLowerCase()) ||
        m.location?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return <LoadingSkeleton type="card" count={6} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Machine Rentals</h1>
                <p className="text-slate-500 mt-1">Browse and request machines from vendors</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Available Machines" value={availableMachines.length} icon={Truck} color="blue" />
                <StatCard title="My Requests" value={myRequests.length} icon={Clock} color="orange" />
                <StatCard title="Approved" value={myRequests.filter(r => r.status === 'APPROVED').length} icon={CheckCircle2} color="green" />
                <StatCard title="In Use" value={myRequests.filter(r => r.status === 'IN_USE').length} icon={Truck} color="purple" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                <button
                    onClick={() => setTab('browse')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'browse'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                >
                    Browse Machines
                </button>
                <button
                    onClick={() => setTab('my-requests')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'my-requests'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                >
                    My Requests ({myRequests.length})
                </button>
            </div>

            {tab === 'browse' && (
                <>
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by code, type, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>

                    {/* Available Machines Grid */}
                    {filteredMachines.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                            <Truck size={48} className="mx-auto mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No machines available
                            </h3>
                            <p className="text-slate-500">Check back later for new listings</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMachines.map((machine) => (
                                <motion.div
                                    key={machine._id}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setSelectedMachine(machine)}
                                    className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {machine.machineCode}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {machine.machineType?.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <StatusBadge status="AVAILABLE" />
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin size={14} />
                                            <span>{machine.location || 'Location TBD'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                                            <DollarSign size={14} />
                                            <span>₹{machine.dailyRate?.toLocaleString() || 0}/day</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-400">
                                            Vendor: {machine.vendorName || 'Contact hidden'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'my-requests' && (
                <DataTable
                    columns={[
                        { key: 'machineCode', label: 'Machine', sortable: true },
                        { key: 'machineType', label: 'Type', render: (val) => val?.replace(/_/g, ' ') || '-' },
                        { key: 'projectName', label: 'Project' },
                        { key: 'requestedDays', label: 'Days', render: (val) => val || '-' },
                        { key: 'dailyRate', label: 'Rate', render: (val) => `₹${val?.toLocaleString() || 0}/day` },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        { key: 'requestedAt', label: 'Requested', render: (val) => new Date(val).toLocaleDateString() },
                    ]}
                    data={myRequests}
                    searchable={false}
                    pageSize={10}
                    emptyMessage="No rental requests yet"
                />
            )}

            {/* Request Modal */}
            <AnimatePresence>
                {selectedMachine && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="text-lg font-semibold">Request Rental</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                                    <p className="font-semibold">{selectedMachine.machineCode}</p>
                                    <p className="text-sm text-slate-500">{selectedMachine.machineType?.replace(/_/g, ' ')}</p>
                                    <p className="text-emerald-600 font-semibold mt-2">
                                        ₹{selectedMachine.dailyRate?.toLocaleString()}/day
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Project *</label>
                                    <select
                                        value={requestForm.projectId}
                                        onChange={(e) => setRequestForm({ ...requestForm, projectId: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <option value="">Choose project...</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Rental Duration (Days)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={requestForm.days}
                                        onChange={(e) => setRequestForm({ ...requestForm, days: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                                    <p className="text-blue-700 dark:text-blue-300">
                                        Estimated Cost: ₹{((selectedMachine.dailyRate || 0) * requestForm.days).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                                <button
                                    onClick={() => setSelectedMachine(null)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestRental}
                                    disabled={!requestForm.projectId}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                                >
                                    Send Request
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
