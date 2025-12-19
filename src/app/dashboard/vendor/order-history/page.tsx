// Vendor Order History Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    Download,
    RefreshCw,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorOrderHistoryPage() {
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<any[]>([])
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [filter])

    async function fetchOrders() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/vendor/orders?status=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setOrders(data.data || [])
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            // Mock data
            setOrders([
                { _id: '1', materialName: 'Cement', quantity: 500, unit: 'bags', projectName: 'Metro Bridge', status: 'DELIVERED', amount: 250000, orderedAt: new Date(Date.now() - 86400000 * 5), deliveredAt: new Date(Date.now() - 86400000 * 2) },
                { _id: '2', materialName: 'Steel Rods', quantity: 200, unit: 'kg', projectName: 'Highway Flyover', status: 'IN_TRANSIT', amount: 180000, orderedAt: new Date(Date.now() - 86400000 * 3) },
                { _id: '3', materialName: 'Bricks', quantity: 10000, unit: 'pieces', projectName: 'Office Complex', status: 'PENDING', amount: 120000, orderedAt: new Date() },
            ])
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(o =>
        o.materialName?.toLowerCase().includes(search.toLowerCase()) ||
        o.projectName?.toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        inTransit: orders.filter(o => o.status === 'IN_TRANSIT').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
    }

    function exportToCSV() {
        const headers = ['Material', 'Quantity', 'Project', 'Status', 'Amount', 'Ordered Date', 'Delivered Date']
        const rows = orders.map(o => [
            o.materialName,
            `${o.quantity} ${o.unit}`,
            o.projectName,
            o.status,
            o.amount,
            new Date(o.orderedAt).toLocaleDateString(),
            o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : '-'
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order History</h1>
                    <p className="text-slate-500 mt-1">All your material orders</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchOrders} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export CSV
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Orders" value={stats.total} icon={Package} color="blue" />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="In Transit" value={stats.inTransit} icon={Truck} color="blue" />
                <StatCard title="Delivered" value={stats.delivered} icon={CheckCircle2} color="green" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    />
                </div>
                <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border">
                    {['all', 'PENDING', 'IN_TRANSIT', 'DELIVERED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {f === 'all' ? 'All' : f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <EmptyState icon={Package} title="No orders" description="No orders match your criteria" />
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Material</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Ordered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 font-medium">{order.materialName}</td>
                                    <td className="px-4 py-3 text-center">{order.quantity} {order.unit}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{order.projectName}</td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">₹{order.amount?.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center text-sm text-slate-500">
                                        {new Date(order.orderedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
