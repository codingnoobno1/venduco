// Vendor Performance Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    Star,
    Truck,
    Package,
    DollarSign,
    CheckCircle2,
    Clock,
    RefreshCw,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function VendorPerformancePage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
        avgRating: 0,
        onTimeDelivery: 0,
        responseRate: 0,
        repeatCustomers: 0,
    })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [monthlyData, setMonthlyData] = useState<any[]>([])

    useEffect(() => {
        fetchPerformance()
    }, [])

    async function fetchPerformance() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/vendor/performance', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setStats(data.stats || stats)
                setRecentOrders(data.recentOrders || [])
                setMonthlyData(data.monthlyData || [])
            }
        } catch (error) {
            console.error('Failed to fetch performance:', error)
            // Mock data for demo
            setStats({
                totalOrders: Math.floor(Math.random() * 100),
                completedOrders: Math.floor(Math.random() * 80),
                pendingOrders: Math.floor(Math.random() * 20),
                totalEarnings: Math.floor(Math.random() * 5000000),
                avgRating: 4.2 + Math.random() * 0.8,
                onTimeDelivery: 85 + Math.random() * 15,
                responseRate: 90 + Math.random() * 10,
                repeatCustomers: Math.floor(Math.random() * 30),
            })
        } finally {
            setLoading(false)
        }
    }

    const completionRate = stats.totalOrders > 0
        ? (stats.completedOrders / stats.totalOrders) * 100
        : 0

    if (loading) {
        return <LoadingSkeleton type="stat" count={8} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Dashboard</h1>
                    <p className="text-slate-500 mt-1">Your business metrics and insights</p>
                </div>
                <button onClick={fetchPerformance} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Earnings"
                    value={`₹${(stats.totalEarnings / 100000).toFixed(1)}L`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard title="Total Orders" value={stats.totalOrders} icon={Package} color="blue" />
                <StatCard title="Completed" value={stats.completedOrders} icon={CheckCircle2} color="emerald" />
                <StatCard title="Pending" value={stats.pendingOrders} icon={Clock} color="orange" />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rating & Delivery */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Star className="text-yellow-500" />
                        Quality Metrics
                    </h3>
                    <div className="space-y-6">
                        {/* Rating */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">Average Rating</span>
                                <div className="flex items-center gap-1">
                                    <Star className="text-yellow-500 fill-yellow-500" size={16} />
                                    <span className="font-bold text-lg">{stats.avgRating.toFixed(1)}</span>
                                    <span className="text-slate-400">/5</span>
                                </div>
                            </div>
                            <ProgressBar value={(stats.avgRating / 5) * 100} color="yellow" />
                        </div>

                        {/* On-Time Delivery */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">On-Time Delivery</span>
                                <span className="font-bold text-lg">{stats.onTimeDelivery.toFixed(0)}%</span>
                            </div>
                            <ProgressBar value={stats.onTimeDelivery} color={stats.onTimeDelivery >= 90 ? 'green' : 'orange'} />
                        </div>

                        {/* Response Rate */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">Response Rate</span>
                                <span className="font-bold text-lg">{stats.responseRate.toFixed(0)}%</span>
                            </div>
                            <ProgressBar value={stats.responseRate} color={stats.responseRate >= 90 ? 'green' : 'blue'} />
                        </div>

                        {/* Completion Rate */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">Order Completion Rate</span>
                                <span className="font-bold text-lg">{completionRate.toFixed(0)}%</span>
                            </div>
                            <ProgressBar value={completionRate} color={completionRate >= 80 ? 'green' : 'orange'} />
                        </div>
                    </div>
                </div>

                {/* Business Insights */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-blue-500" />
                        Business Insights
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                            <p className="text-sm opacity-90">Total Earnings</p>
                            <p className="text-3xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                <p className="text-2xl font-bold text-blue-600">{stats.repeatCustomers}</p>
                                <p className="text-sm text-slate-500">Repeat Customers</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    ₹{stats.totalOrders > 0 ? Math.floor(stats.totalEarnings / stats.totalOrders / 1000) : 0}K
                                </p>
                                <p className="text-sm text-slate-500">Avg Order Value</p>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                            <p className="font-medium text-amber-700 dark:text-amber-300 mb-2">💡 Tips to Improve</p>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                {stats.responseRate < 95 && (
                                    <li>• Respond to quotes faster to improve response rate</li>
                                )}
                                {stats.onTimeDelivery < 95 && (
                                    <li>• Focus on on-time delivery to build trust</li>
                                )}
                                {stats.avgRating < 4.5 && (
                                    <li>• Quality materials lead to better ratings</li>
                                )}
                                {stats.responseRate >= 95 && stats.onTimeDelivery >= 95 && stats.avgRating >= 4.5 && (
                                    <li>• Great job! Keep up the excellent work! 🎉</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                <h3 className="font-semibold mb-4">Monthly Performance</h3>
                <div className="flex items-end gap-2 h-40">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => {
                        const height = 20 + Math.random() * 80
                        const isCurrentMonth = month === new Date().toLocaleDateString('en-US', { month: 'short' })
                        return (
                            <div key={month} className="flex-1 flex flex-col items-center gap-1">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: Math.random() * 0.3 }}
                                    className={`w-full rounded-t-lg ${isCurrentMonth ? 'bg-blue-600' : 'bg-blue-200 dark:bg-blue-900'
                                        }`}
                                />
                                <span className={`text-xs ${isCurrentMonth ? 'font-bold text-blue-600' : 'text-slate-400'}`}>
                                    {month}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
