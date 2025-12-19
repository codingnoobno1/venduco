// PM Material Requests Page - Request materials from vendors
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Package,
    Send,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Users,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function PMMaterialRequestsPage() {
    const router = useRouter()
    const [requests, setRequests] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [filter, setFilter] = useState('all')

    const [newRequest, setNewRequest] = useState({
        projectId: '',
        materialName: '',
        category: 'STRUCTURAL',
        quantity: 1,
        unit: 'PCS',
        priority: 'NORMAL',
        requiredBy: '',
        notes: '',
        broadcastToAll: true,
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            // Fetch projects
            const projectsRes = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])

            // Fetch material requests
            const requestsRes = await fetch('/api/material-requests', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const requestsData = await requestsRes.json()
            setRequests(requestsData.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmitRequest(e: React.FormEvent) {
        e.preventDefault()
        const token = localStorage.getItem('token')

        try {
            await fetch('/api/material-requests', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRequest)
            })

            setShowRequestModal(false)
            setNewRequest({
                projectId: '',
                materialName: '',
                category: 'STRUCTURAL',
                quantity: 1,
                unit: 'PCS',
                priority: 'NORMAL',
                requiredBy: '',
                notes: '',
                broadcastToAll: true,
            })
            fetchData()
        } catch (error) {
            console.error('Failed to submit request:', error)
        }
    }

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        quoted: requests.filter(r => r.status === 'QUOTED').length,
        fulfilled: requests.filter(r => r.status === 'FULFILLED').length,
    }

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => r.status === filter)

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Material Requests</h1>
                    <p className="text-slate-500 mt-1">Request materials from vendors for your projects</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowRequestModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Request
                    </motion.button>
                </div>
            </div>

            {/* Quick Request Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} />
                        <div>
                            <p className="font-semibold">Need materials urgently?</p>
                            <p className="text-sm text-orange-100">Broadcast your request to all registered material suppliers</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium"
                    >
                        Quick Request
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Requests" value={stats.total} icon={Package} color="blue" />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="Quoted" value={stats.quoted} icon={Send} color="purple" />
                <StatCard title="Fulfilled" value={stats.fulfilled} icon={CheckCircle2} color="green" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'PENDING', label: 'Pending' },
                    { key: 'QUOTED', label: 'Quoted' },
                    { key: 'APPROVED', label: 'Approved' },
                    { key: 'FULFILLED', label: 'Fulfilled' },
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

            {/* Requests Table */}
            {filteredRequests.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No material requests"
                    description="Create your first material request to get quotes from vendors"
                    action={{
                        label: 'New Request',
                        onClick: () => setShowRequestModal(true)
                    }}
                />
            ) : (
                <DataTable
                    columns={[
                        { key: 'materialName', label: 'Material', sortable: true },
                        { key: 'projectName', label: 'Project', render: (val) => val || '-' },
                        { key: 'quantity', label: 'Qty', render: (val, row) => `${val} ${row.unit}` },
                        { key: 'priority', label: 'Priority', render: (val) => <StatusBadge status={val} /> },
                        { key: 'requiredBy', label: 'Required By', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
                        { key: 'quotesReceived', label: 'Quotes', render: (val) => `${val || 0} received` },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                    ]}
                    data={filteredRequests}
                    searchable={true}
                    searchKeys={['materialName', 'projectName']}
                    pageSize={10}
                />
            )}

            {/* New Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Request Material</h2>
                            <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Project</label>
                                <select
                                    value={newRequest.projectId}
                                    onChange={(e) => setNewRequest({ ...newRequest, projectId: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Material Name *</label>
                                <input
                                    type="text"
                                    value={newRequest.materialName}
                                    onChange={(e) => setNewRequest({ ...newRequest, materialName: e.target.value })}
                                    required
                                    placeholder="e.g., 10m Steel Pillars for Mass Erection"
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={newRequest.category}
                                        onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="STRUCTURAL">Structural</option>
                                        <option value="ELECTRICAL">Electrical</option>
                                        <option value="CONSUMABLES">Consumables</option>
                                        <option value="SAFETY">Safety Equipment</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Priority</label>
                                    <select
                                        value={newRequest.priority}
                                        onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={newRequest.quantity}
                                        onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) })}
                                        min={1}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit</label>
                                    <select
                                        value={newRequest.unit}
                                        onChange={(e) => setNewRequest({ ...newRequest, unit: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="PCS">Pieces</option>
                                        <option value="KG">Kilograms</option>
                                        <option value="TON">Tons</option>
                                        <option value="MTR">Meters</option>
                                        <option value="SET">Sets</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Required By Date</label>
                                <input
                                    type="date"
                                    value={newRequest.requiredBy}
                                    onChange={(e) => setNewRequest({ ...newRequest, requiredBy: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                <textarea
                                    value={newRequest.notes}
                                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Specifications, delivery location, etc."
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="broadcast"
                                    checked={newRequest.broadcastToAll}
                                    onChange={(e) => setNewRequest({ ...newRequest, broadcastToAll: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="broadcast" className="text-sm">
                                    <span className="font-medium">Broadcast to all vendors</span>
                                    <span className="text-slate-500 ml-1">- Get quotes from multiple suppliers</span>
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center gap-2">
                                    <Send size={18} />
                                    Send Request
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
