// Vendor My Bids Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Plus,
    RefreshCw,
    FileText,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorBidsPage() {
    const router = useRouter()
    const [bids, setBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedBid, setSelectedBid] = useState<any>(null)

    useEffect(() => {
        fetchBids()
    }, [])

    async function fetchBids() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/bids/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setBids(data.data || [])
        } catch (error) {
            console.error('Failed to fetch bids:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredBids = filter === 'all'
        ? bids
        : bids.filter(b => b.status === filter)

    const stats = {
        total: bids.length,
        submitted: bids.filter(b => b.status === 'SUBMITTED').length,
        approved: bids.filter(b => b.status === 'APPROVED').length,
        rejected: bids.filter(b => b.status === 'REJECTED').length,
    }

    const totalValue = bids.reduce((sum, b) => sum + (b.proposedAmount || 0), 0)

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Bids</h1>
                    <p className="text-slate-500 mt-1">Track your submitted project bids</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/vendor/bids/browse')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    Browse Projects
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Bids" value={stats.total} icon={FileText} color="blue" />
                <StatCard title="Pending" value={stats.submitted} icon={Clock} color="orange" />
                <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} color="green" />
                <StatCard title="Total Value" value={`₹${(totalValue / 100000).toFixed(1)}L`} icon={DollarSign} color="purple" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'SUBMITTED', label: 'Pending' },
                    { key: 'APPROVED', label: 'Approved' },
                    { key: 'REJECTED', label: 'Rejected' },
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

            {/* Bids Table */}
            {filteredBids.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No bids found"
                    description={filter === 'all' ? 'Browse open projects and submit your first bid' : 'No bids in this category'}
                    action={{
                        label: 'Browse Projects',
                        onClick: () => router.push('/dashboard/vendor/bids/browse')
                    }}
                />
            ) : (
                <DataTable
                    columns={[
                        { key: 'projectName', label: 'Project', sortable: true, render: (val) => val || 'Unknown' },
                        { key: 'proposedAmount', label: 'Amount', sortable: true, render: (val) => `₹${(val || 0).toLocaleString()}` },
                        { key: 'timeline.durationDays', label: 'Duration', render: (_, row) => `${row.timeline?.durationDays || 0} days` },
                        { key: 'manpowerOffered', label: 'Manpower', render: (val) => val || '-' },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        { key: 'submittedAt', label: 'Submitted', render: (val) => new Date(val).toLocaleDateString() },
                        {
                            key: 'actions',
                            label: 'Actions',
                            render: (_, row) => (
                                <button
                                    onClick={() => setSelectedBid(row)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                                >
                                    <Eye size={16} />
                                </button>
                            )
                        }
                    ]}
                    data={filteredBids}
                    searchable={true}
                    searchKeys={['projectName']}
                    pageSize={10}
                />
            )}

            {/* Bid Detail Modal */}
            {selectedBid && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Bid Details</h2>
                            <button onClick={() => setSelectedBid(null)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-lg">{selectedBid.projectName}</p>
                                    <p className="text-sm text-slate-500">Submitted {new Date(selectedBid.submittedAt).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={selectedBid.status} size="md" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                                    <p className="text-slate-500">Amount</p>
                                    <p className="text-lg font-bold text-emerald-600">₹{selectedBid.proposedAmount?.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                                    <p className="text-slate-500">Duration</p>
                                    <p className="text-lg font-bold">{selectedBid.timeline?.durationDays || 0} days</p>
                                </div>
                            </div>

                            {selectedBid.proposal && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Proposal</p>
                                    <p className="text-sm bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">{selectedBid.proposal}</p>
                                </div>
                            )}

                            {selectedBid.status === 'REJECTED' && selectedBid.rejectionReason && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        <strong>Rejection Reason:</strong> {selectedBid.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
