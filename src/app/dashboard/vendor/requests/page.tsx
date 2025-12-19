// Vendor Material Requests - View and quote on incoming requests
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Send,
    Clock,
    DollarSign,
    AlertTriangle,
    RefreshCw,
    Eye,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorMaterialRequestsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [quoteForm, setQuoteForm] = useState({
        unitPrice: 0,
        deliveryDays: 7,
        notes: '',
    })

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/material-requests?view=vendor', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setRequests(data.data || [])
        } catch (error) {
            console.error('Failed to fetch requests:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmitQuote(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedRequest) return

        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/material-requests/${selectedRequest._id}/quote`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...quoteForm,
                    totalPrice: quoteForm.unitPrice * selectedRequest.quantity
                })
            })

            setSelectedRequest(null)
            setQuoteForm({ unitPrice: 0, deliveryDays: 7, notes: '' })
            fetchRequests()
        } catch (error) {
            console.error('Failed to submit quote:', error)
        }
    }

    const stats = {
        total: requests.length,
        urgent: requests.filter(r => r.priority === 'URGENT' || r.priority === 'HIGH').length,
        pending: requests.filter(r => r.status === 'PENDING').length,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Material Requests</h1>
                    <p className="text-slate-500 mt-1">View and submit quotes for material requests from PMs</p>
                </div>
                <button onClick={fetchRequests} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Open Requests" value={stats.total} icon={Package} color="blue" />
                <StatCard title="Urgent" value={stats.urgent} icon={AlertTriangle} color="orange" />
                <StatCard title="Awaiting Quote" value={stats.pending} icon={Clock} color="purple" />
            </div>

            {/* Requests */}
            {requests.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No material requests"
                    description="When PMs broadcast material requests, they will appear here for you to quote"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.map((req) => (
                        <motion.div
                            key={req._id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {req.materialName}
                                    </h3>
                                    <p className="text-sm text-slate-500">{req.projectName || 'Project'}</p>
                                </div>
                                <StatusBadge status={req.priority} />
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex justify-between">
                                    <span>Quantity:</span>
                                    <span className="font-semibold">{req.quantity} {req.unit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Category:</span>
                                    <span>{req.category}</span>
                                </div>
                                {req.requiredBy && (
                                    <div className="flex justify-between">
                                        <span>Required By:</span>
                                        <span className="text-orange-600 font-medium">
                                            {new Date(req.requiredBy).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Quotes:</span>
                                    <span>{req.quotesReceived || 0} received</span>
                                </div>
                            </div>

                            {req.notes && (
                                <p className="mt-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                    {req.notes}
                                </p>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRequest(req)}
                                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <DollarSign size={18} />
                                Submit Quote
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Quote Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Submit Quote</h2>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
                            <p className="font-medium">{selectedRequest.materialName}</p>
                            <p className="text-sm text-slate-500">
                                {selectedRequest.quantity} {selectedRequest.unit} • {selectedRequest.category}
                            </p>
                        </div>

                        <form onSubmit={handleSubmitQuote} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Unit Price (₹)</label>
                                <input
                                    type="number"
                                    value={quoteForm.unitPrice}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: parseInt(e.target.value) })}
                                    min={1}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Total Price:</strong> ₹{(quoteForm.unitPrice * selectedRequest.quantity).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Delivery Time (days)</label>
                                <input
                                    type="number"
                                    value={quoteForm.deliveryDays}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryDays: parseInt(e.target.value) })}
                                    min={1}
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    value={quoteForm.notes}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                                    rows={2}
                                    placeholder="Delivery terms, availability, etc."
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setSelectedRequest(null)} className="px-4 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg flex items-center gap-2">
                                    <Send size={18} />
                                    Submit Quote
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
