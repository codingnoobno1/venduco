// Vendor Billing Summary Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    Download,
    Clock,
    CheckCircle2,
    RefreshCw,
    FileText,
    Calendar,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function VendorBillingPage() {
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState({
        totalEarnings: 0,
        pendingAmount: 0,
        paidAmount: 0,
        ordersCompleted: 0,
    })
    const [transactions, setTransactions] = useState<any[]>([])
    const [period, setPeriod] = useState('month')

    useEffect(() => {
        fetchBilling()
    }, [period])

    async function fetchBilling() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/vendor/billing/summary?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setSummary(data.summary || { totalEarnings: 0, pendingAmount: 0, paidAmount: 0, ordersCompleted: 0 })
            setTransactions(data.transactions || [])
        } catch (error) {
            console.error('Failed to fetch billing:', error)
            // Mock data
            setSummary({
                totalEarnings: Math.floor(Math.random() * 5000000),
                pendingAmount: Math.floor(Math.random() * 500000),
                paidAmount: Math.floor(Math.random() * 4500000),
                ordersCompleted: Math.floor(Math.random() * 50),
            })
        } finally {
            setLoading(false)
        }
    }

    function downloadCSV() {
        const headers = ['Date', 'Project', 'Description', 'Amount', 'Status']
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.projectName || '',
            t.description || '',
            t.amount || 0,
            t.status || 'PENDING'
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `billing-${period}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    if (loading) {
        return <LoadingSkeleton type="stat" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing Summary</h1>
                    <p className="text-slate-500 mt-1">Track your earnings and pending payments</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                    <button onClick={fetchBilling} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadCSV}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export CSV
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Earnings" value={`₹${(summary.totalEarnings / 100000).toFixed(1)}L`} icon={DollarSign} color="green" />
                <StatCard title="Pending" value={`₹${(summary.pendingAmount / 100000).toFixed(1)}L`} icon={Clock} color="orange" />
                <StatCard title="Received" value={`₹${(summary.paidAmount / 100000).toFixed(1)}L`} icon={CheckCircle2} color="blue" />
                <StatCard title="Orders Completed" value={summary.ordersCompleted} icon={FileText} color="purple" />
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Category */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                    <h3 className="font-semibold mb-4">Earnings by Category</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Machine Rentals', amount: summary.totalEarnings * 0.6, color: 'bg-purple-500' },
                            { label: 'Material Orders', amount: summary.totalEarnings * 0.35, color: 'bg-orange-500' },
                            { label: 'Other Services', amount: summary.totalEarnings * 0.05, color: 'bg-blue-500' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <span className="flex-1 text-sm">{item.label}</span>
                                <span className="font-semibold">₹{(item.amount / 100000).toFixed(1)}L</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Status */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                    <h3 className="font-semibold mb-4">Payment Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-600" size={24} />
                                <span>Paid</span>
                            </div>
                            <span className="text-xl font-bold text-emerald-600">
                                ₹{(summary.paidAmount / 100000).toFixed(1)}L
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Clock className="text-orange-600" size={24} />
                                <span>Pending</span>
                            </div>
                            <span className="text-xl font-bold text-orange-600">
                                ₹{(summary.pendingAmount / 100000).toFixed(1)}L
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Recent Transactions</h3>
                </div>
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText size={48} className="mx-auto mb-4 text-slate-400" />
                        <p>No transactions in this period</p>
                    </div>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'date', label: 'Date', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
                            { key: 'projectName', label: 'Project', render: (val) => val || '-' },
                            { key: 'description', label: 'Description' },
                            { key: 'amount', label: 'Amount', sortable: true, render: (val) => `₹${(val || 0).toLocaleString()}` },
                            { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        ]}
                        data={transactions}
                        pageSize={10}
                    />
                )}
            </div>
        </div>
    )
}
