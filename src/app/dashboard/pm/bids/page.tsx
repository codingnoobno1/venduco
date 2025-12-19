// PM Bids Management Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DollarSign, Filter, Eye, CheckCircle2, XCircle } from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { BidReview } from '@/components/dashboard/pm/BidReview'

export default function PMBidsPage() {
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
            // Fetch projects first, then bids for each
            const projectsRes = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectsData = await projectsRes.json()
            const projects = projectsData.data || []

            // Fetch bids for each project
            const allBids: any[] = []
            for (const project of projects.slice(0, 10)) {
                try {
                    const bidsRes = await fetch(`/api/projects/${project._id}/bids`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    const bidsData = await bidsRes.json()
                    if (bidsData.data) {
                        bidsData.data.forEach((bid: any) => {
                            allBids.push({
                                ...bid,
                                projectName: project.name,
                                projectCode: project.projectCode,
                            })
                        })
                    }
                } catch (e) {
                    console.error('Failed to fetch bids for project:', project._id)
                }
            }

            setBids(allBids)
        } catch (error) {
            console.error('Failed to fetch bids:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove(bidId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/bids/${bidId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'approve' })
            })
            setSelectedBid(null)
            fetchBids()
        } catch (error) {
            console.error('Failed to approve bid:', error)
        }
    }

    async function handleReject(bidId: string, reason: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/bids/${bidId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'reject', rejectionReason: reason })
            })
            setSelectedBid(null)
            fetchBids()
        } catch (error) {
            console.error('Failed to reject bid:', error)
        }
    }

    const filteredBids = filter === 'all'
        ? bids
        : bids.filter(b => b.status === filter)

    const statusCounts = {
        all: bids.length,
        SUBMITTED: bids.filter(b => b.status === 'SUBMITTED').length,
        APPROVED: bids.filter(b => b.status === 'APPROVED').length,
        REJECTED: bids.filter(b => b.status === 'REJECTED').length,
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bid Management</h1>
                <p className="text-slate-500 mt-1">Review and manage bids for your projects</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All Bids' },
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
                        {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts]})
                    </button>
                ))}
            </div>

            {/* Bids Table */}
            {filteredBids.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <DollarSign size={48} className="mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No bids found
                    </h3>
                    <p className="text-slate-500">
                        {filter === 'all' ? 'No bids have been submitted yet' : `No ${filter.toLowerCase()} bids`}
                    </p>
                </div>
            ) : (
                <DataTable
                    columns={[
                        { key: 'projectCode', label: 'Project', sortable: true },
                        { key: 'bidderName', label: 'Bidder', sortable: true },
                        { key: 'proposedAmount', label: 'Amount', sortable: true, render: (val) => `₹${val?.toLocaleString() || 0}` },
                        { key: 'timeline.durationDays', label: 'Duration', render: (_, row) => `${row.timeline?.durationDays || 0} days` },
                        { key: 'manpowerOffered', label: 'Manpower', render: (val) => val || '-' },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        { key: 'submittedAt', label: 'Submitted', render: (val) => new Date(val).toLocaleDateString() },
                        {
                            key: 'actions',
                            label: 'Actions',
                            render: (_, row) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedBid(row)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                                        title="View"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    {row.status === 'SUBMITTED' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(row._id)}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                                title="Approve"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleReject(row._id, 'Not meeting requirements')}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
                                                title="Reject"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    data={filteredBids}
                    searchable={true}
                    searchKeys={['projectCode', 'bidderName']}
                    pageSize={10}
                />
            )}

            {/* Bid Detail Modal */}
            {selectedBid && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Bid Details</h2>
                            <button
                                onClick={() => setSelectedBid(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <BidReview
                                bid={selectedBid}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
