// Vendor My Bids Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    DollarSign,
    CheckCircle2,
    Clock,
    Eye,
    Plus,
    FileText,
    PencilLine,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import apiRequest from '@/lib/api'

interface MyBid {
    _id: string
    tenderId: string
    title: string
    referenceNumber: string
    project?: string
    status: 'DRAFT' | 'SUBMITTED'
    amount?: { amountMinor: number; currency: string }
    closingDate?: string
    tenderOpen: boolean
    submittedAt?: string
    outcome?: 'AWARDED_TO_YOU' | 'NOT_SELECTED'
}

const TENDERS = '/partner/tenders'

/** What the bidder should read as the state of a bid: the award outcome once there is one. */
function stateOf(bid: MyBid) {
    if (bid.outcome === 'AWARDED_TO_YOU') return 'AWARDED'
    if (bid.outcome === 'NOT_SELECTED') return 'NOT_SELECTED'
    return bid.status
}

function formatAmount(amount?: MyBid['amount']) {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: amount.currency, maximumFractionDigits: 0 })
        .format(amount.amountMinor / 100)
}

function formatDate(value?: string) {
    return value ? new Date(value).toLocaleDateString() : '-'
}

export default function VendorBidsPage() {
    const router = useRouter()
    const [bids, setBids] = useState<MyBid[]>([])
    const [loading, setLoading] = useState(true)
    const [failed, setFailed] = useState(false)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        apiRequest<{ data: MyBid[] }>('/bids/my')
            .then(res => setBids(res.data || []))
            .catch(() => setFailed(true))
            .finally(() => setLoading(false))
    }, [])

    const rows = bids.map(b => ({ ...b, state: stateOf(b) }))
    const filteredBids = filter === 'all' ? rows : rows.filter(b => b.state === filter)

    const submitted = rows.filter(b => b.status === 'SUBMITTED')
    const totalValue = submitted.reduce((sum, b) => sum + (b.amount?.amountMinor || 0), 0) / 100

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Bids</h1>
                    <p className="text-slate-500 mt-1">Track the bids you have drafted and submitted</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(TENDERS)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    Browse Tenders
                </motion.button>
            </div>

            {failed && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Your bids could not be loaded. Reload the page to try again.
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Bids" value={rows.length} icon={FileText} color="blue" />
                <StatCard title="Drafts" value={rows.filter(b => b.state === 'DRAFT').length} icon={PencilLine} color="orange" />
                <StatCard title="Awarded" value={rows.filter(b => b.state === 'AWARDED').length} icon={CheckCircle2} color="green" />
                <StatCard title="Submitted Value" value={`₹${(totalValue / 100000).toFixed(1)}L`} icon={DollarSign} color="purple" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'DRAFT', label: 'Drafts' },
                    { key: 'SUBMITTED', label: 'Submitted' },
                    { key: 'AWARDED', label: 'Awarded' },
                    { key: 'NOT_SELECTED', label: 'Not selected' },
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
                    icon={filter === 'all' ? FileText : Clock}
                    title="No bids found"
                    description={filter === 'all' ? 'Browse open tenders and submit your first bid' : 'No bids in this category'}
                    action={{
                        label: 'Browse Tenders',
                        onClick: () => router.push(TENDERS)
                    }}
                />
            ) : (
                <DataTable
                    columns={[
                        { key: 'title', label: 'Tender', sortable: true },
                        { key: 'referenceNumber', label: 'Reference', sortable: true },
                        { key: 'project', label: 'Project', render: (val) => val || '-' },
                        { key: 'amount', label: 'Amount', render: (val) => formatAmount(val) },
                        { key: 'state', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        { key: 'closingDate', label: 'Closes', render: (val) => formatDate(val) },
                        { key: 'submittedAt', label: 'Submitted', render: (val) => formatDate(val) },
                        {
                            key: 'actions',
                            label: 'Actions',
                            render: (_, row) => (
                                <button
                                    onClick={() => router.push(`${TENDERS}/${row.tenderId}`)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                                    title={row.state === 'DRAFT' && row.tenderOpen ? 'Continue bid' : 'View bid'}
                                >
                                    {row.state === 'DRAFT' && row.tenderOpen ? <PencilLine size={16} /> : <Eye size={16} />}
                                </button>
                            )
                        }
                    ]}
                    data={filteredBids}
                    searchable={true}
                    searchKeys={['title', 'referenceNumber', 'project']}
                    pageSize={10}
                />
            )}
        </div>
    )
}
