// Vendor Orders Page - Track material orders
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    RefreshCw,
    Eye,
    MapPin,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/material-requests?view=vendor', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            // Filter to only show requests where this vendor's quote was selected
            const myOrders = (data.data || []).filter((r: any) =>
                r.status === 'APPROVED' || r.status === 'FULFILLED'
            )
            setOrders(myOrders)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    async function updateOrderStatus(orderId: string, status: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/material-requests/${orderId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            })
            fetchOrders()
            setSelectedOrder(null)
        } catch (error) {
            console.error('Failed to update order:', error)
        }
    }

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'APPROVED').length,
        shipped: orders.filter(o => o.status === 'SHIPPED').length,
        delivered: orders.filter(o => o.status === 'FULFILLED').length,
    }

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter)

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
                    <p className="text-slate-500 mt-1">Track and fulfill approved material orders</p>
                </div>
                <button onClick={fetchOrders} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Orders" value={stats.total} icon={Package} color="blue" />
                <StatCard title="To Ship" value={stats.pending} icon={Clock} color="orange" />
                <StatCard title="In Transit" value={stats.shipped} icon={Truck} color="purple" />
                <StatCard title="Delivered" value={stats.delivered} icon={CheckCircle2} color="green" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'APPROVED', label: 'To Ship' },
                    { key: 'SHIPPED', label: 'In Transit' },
                    { key: 'FULFILLED', label: 'Delivered' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === tab.key ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {filteredOrders.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No orders yet"
                    description="When your quotes are accepted, orders will appear here"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOrders.map((order) => (
                        <motion.div
                            key={order._id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 border"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold">{order.materialName}</h3>
                                    <p className="text-sm text-slate-500">{order.projectName || 'Project'}</p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <div>
                                    <p className="text-slate-500">Quantity</p>
                                    <p className="font-semibold">{order.quantity} {order.unit}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Value</p>
                                    <p className="font-semibold text-emerald-600">
                                        ₹{(order.selectedQuote?.totalPrice || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Required By</p>
                                    <p className="font-medium">
                                        {order.requiredBy ? new Date(order.requiredBy).toLocaleDateString() : 'ASAP'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Requester</p>
                                    <p className="font-medium">{order.requesterName || 'PM'}</p>
                                </div>
                            </div>

                            {order.status === 'APPROVED' && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => updateOrderStatus(order._id, 'SHIPPED')}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                    <Truck size={18} />
                                    Mark as Shipped
                                </motion.button>
                            )}

                            {order.status === 'SHIPPED' && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => updateOrderStatus(order._id, 'FULFILLED')}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Mark as Delivered
                                </motion.button>
                            )}

                            {order.status === 'FULFILLED' && (
                                <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                                    ✓ Order Complete
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
