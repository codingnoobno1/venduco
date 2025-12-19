// PM Quote Approval Page - Compare and approve vendor quotes
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    Package,
    Truck,
    Check,
    X,
    Clock,
    RefreshCw,
    Eye,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function PMQuotesPage() {
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState<any[]>([])
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [quotes, setQuotes] = useState<any[]>([])
    const [filter, setFilter] = useState('QUOTED')

    useEffect(() => {
        fetchRequests()
    }, [filter])

    async function fetchRequests() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/material-requests?status=${filter}`, {
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

    async function fetchQuotes(requestId: string) {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/material-requests/${requestId}/quotes`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setQuotes(data.data?.quotes || [])
        } catch (error) {
            console.error('Failed to fetch quotes:', error)
        }
    }

    async function approveQuote(requestId: string, vendorId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/material-requests/${requestId}/approve`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vendorId })
            })
            setSelectedRequest(null)
            fetchRequests()
        } catch (error) {
            console.error('Failed to approve quote:', error)
        }
    }

    function openComparison(request: any) {
        setSelectedRequest(request)
        fetchQuotes(request._id)
    }

    const stats = {
        pending: requests.filter(r => r.status === 'PENDING').length,
        quoted: requests.filter(r => r.status === 'QUOTED').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quote Approval</h1>
                    <p className="text-slate-500 mt-1">Compare and approve vendor quotes</p>
                </div>
                <button onClick={fetchRequests} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Pending Quotes" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="Ready to Approve" value={stats.quoted} icon={DollarSign} color="blue" />
                <StatCard title="Approved" value={stats.approved} icon={Check} color="green" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {['PENDING', 'QUOTED', 'APPROVED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No material requests"
                    description={`No ${filter.toLowerCase()} requests found`}
                />
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Material</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Quantity</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Quotes</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Required By</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{req.materialName}</p>
                                        <p className="text-xs text-slate-500">{req.category}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{req.projectName}</td>
                                    <td className="px-4 py-3 text-center text-sm">{req.quantity} {req.unit}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {req.quotes?.length || 0} quotes
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm">
                                        {req.requiredBy ? new Date(req.requiredBy).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {req.quotes?.length > 0 && req.status !== 'APPROVED' && (
                                            <button
                                                onClick={() => openComparison(req)}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                            >
                                                <Eye size={14} className="inline mr-1" />
                                                Compare
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Quote Comparison Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-auto"
                    >
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold">Compare Quotes</h2>
                                <p className="text-sm text-slate-500">
                                    {selectedRequest.materialName} - {selectedRequest.quantity} {selectedRequest.unit}
                                </p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>

                        <div className="p-6">
                            {quotes.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No quotes received yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {quotes.map((quote, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border-2 ${idx === 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600">
                                                        #{idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{quote.vendorName}</p>
                                                        {idx === 0 && (
                                                            <span className="text-xs text-green-600">⭐ Best Value</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">₹{quote.totalPrice?.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500">₹{quote.unitPrice}/unit</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Truck size={16} className="text-slate-400" />
                                                    <span>{quote.deliveryDays} days delivery</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500">Price Rank:</span>
                                                    <span className="font-medium">#{quote.priceRank}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500">Delivery Rank:</span>
                                                    <span className="font-medium">#{quote.deliveryRank}</span>
                                                </div>
                                            </div>

                                            {quote.notes && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 italic">
                                                    "{quote.notes}"
                                                </p>
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => approveQuote(selectedRequest._id, quote.vendorId)}
                                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                            >
                                                <Check size={18} />
                                                Approve This Quote
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
