"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    PieChart,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    User,
    FileText
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function FinanceDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mock data for now until finance APIs are fully ready
        setTimeout(() => {
            setStats({
                totalBudget: 50000000,
                spent: 12500000,
                pendingInvoices: 5,
                alerts: 2
            })
            setLoading(false)
        }, 1000)
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton type="stat" count={4} />
                <LoadingSkeleton type="card" count={2} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finance Dashboard</h1>
                    <p className="text-slate-500 mt-1">Financial overview and controls</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/profile')}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex items-center gap-2"
                    >
                        <User size={18} />
                        My Profile
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Budget (All Project)"
                    value={`₹${(stats.totalBudget / 10000000).toFixed(1)}Cr`}
                    icon={PieChart}
                    color="blue"
                />
                <StatCard
                    title="Total Spent"
                    value={`₹${(stats.spent / 10000000).toFixed(1)}Cr`}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="Pending Invoices"
                    value={stats.pendingInvoices}
                    icon={FileText}
                    color="orange"
                />
                <StatCard
                    title="Cost Alerts"
                    value={stats.alerts}
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
                <DollarSign size={48} className="mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Financial Activity</h3>
                <p className="text-slate-500 mt-2">Recent transactions and budget updates will appear here.</p>
            </div>
        </div>
    )
}
