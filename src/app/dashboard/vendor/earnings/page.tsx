// Vendor Earnings Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Download,
    Truck,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'

export default function VendorEarningsPage() {
    const [loading, setLoading] = useState(true)
    const [earnings, setEarnings] = useState<any>({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        pending: 0,
        transactions: [],
    })
    const [period, setPeriod] = useState('month')

    useEffect(() => {
        fetchEarnings()
    }, [period])

    async function fetchEarnings() {
        const token = localStorage.getItem('token')
        try {
            // Fetch rental data and calculate earnings
            const res = await fetch('/api/machinerentals?view=vendor-requests', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            const rentals = data.data || []

            // Calculate earnings from completed rentals
            const completed = rentals.filter((r: any) => r.status === 'COMPLETED')
            const pending = rentals.filter((r: any) => r.status === 'IN_USE')

            const total = completed.reduce((sum: number, r: any) =>
                sum + ((r.dailyRate || 0) * (r.actualDays || r.requestedDays || 0)), 0
            )
            const pendingAmount = pending.reduce((sum: number, r: any) =>
                sum + ((r.dailyRate || 0) * (r.requestedDays || 0)), 0
            )

            // Create transaction list from rentals
            const transactions = rentals.map((r: any) => ({
                id: r._id,
                description: `${r.machineCode} rental to ${r.requesterName || 'Unknown'}`,
                amount: (r.dailyRate || 0) * (r.actualDays || r.requestedDays || 0),
                date: r.startDate || r.createdAt,
                status: r.status,
                type: r.status === 'COMPLETED' ? 'credit' : 'pending',
            }))

            setEarnings({
                total,
                thisMonth: total * 0.4, // Mock distribution
                lastMonth: total * 0.35,
                pending: pendingAmount,
                transactions,
            })
        } catch (error) {
            console.error('Failed to fetch earnings:', error)
        } finally {
            setLoading(false)
        }
    }

    const monthlyChange = earnings.lastMonth > 0
        ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)
        : 0
    const isPositive = Number(monthlyChange) >= 0

    if (loading) {
        return <LoadingSkeleton type="stat" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
                    <p className="text-slate-500 mt-1">Track your rental income and payments</p>
                </div>
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Download size={18} />
                    Export
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Earnings" value={`₹${earnings.total.toLocaleString()}`} icon={DollarSign} color="green" />
                <StatCard title="This Month" value={`₹${earnings.thisMonth.toLocaleString()}`} icon={Calendar} color="blue" />
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Monthly Change</p>
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{monthlyChange}%
                        </span>
                        {isPositive ? (
                            <ArrowUpRight className="text-emerald-600" size={24} />
                        ) : (
                            <ArrowDownRight className="text-red-600" size={24} />
                        )}
                    </div>
                </div>
                <StatCard title="Pending" value={`₹${earnings.pending.toLocaleString()}`} icon={Truck} color="orange" />
            </div>

            {/* Period Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                {[
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' },
                    { key: 'year', label: 'This Year' },
                    { key: 'all', label: 'All Time' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setPeriod(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === tab.key
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Machine Type */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Earnings by Machine Type</h3>
                    <div className="space-y-4">
                        {[
                            { type: 'Excavator', amount: earnings.total * 0.35, percent: 35 },
                            { type: 'Tower Crane', amount: earnings.total * 0.28, percent: 28 },
                            { type: 'Bulldozer', amount: earnings.total * 0.22, percent: 22 },
                            { type: 'Others', amount: earnings.total * 0.15, percent: 15 },
                        ].map(item => (
                            <div key={item.type}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.type}</span>
                                    <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                                </div>
                                <ProgressBar value={item.percent} color="blue" size="sm" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                        {earnings.transactions.slice(0, 5).map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div>
                                    <p className="text-sm font-medium truncate max-w-xs">{tx.description}</p>
                                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                        {tx.type === 'credit' ? '+' : ''}₹{tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">{tx.status}</p>
                                </div>
                            </div>
                        ))}
                        {earnings.transactions.length === 0 && (
                            <p className="text-center text-slate-500 py-4">No transactions yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* All Transactions Table */}
            {earnings.transactions.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold">All Transactions</h3>
                    </div>
                    <div className="p-4">
                        <DataTable
                            columns={[
                                { key: 'description', label: 'Description', sortable: true },
                                { key: 'amount', label: 'Amount', sortable: true, render: (val) => `₹${val.toLocaleString()}` },
                                { key: 'date', label: 'Date', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
                                { key: 'status', label: 'Status' },
                            ]}
                            data={earnings.transactions}
                            pageSize={10}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
