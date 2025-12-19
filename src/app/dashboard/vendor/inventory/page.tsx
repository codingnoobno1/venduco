// Vendor Inventory/Materials Page - For Material Suppliers
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Package,
    Plus,
    Search,
    RefreshCw,
    Truck,
    AlertTriangle,
    CheckCircle2,
    Edit2,
    Trash2,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorInventoryPage() {
    const router = useRouter()
    const [inventory, setInventory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'STRUCTURAL',
        unit: 'PCS',
        quantity: 0,
        unitPrice: 0,
        minStock: 10,
        location: '',
    })

    useEffect(() => {
        fetchInventory()
    }, [])

    async function fetchInventory() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/inventory', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setInventory(data.data || [])
        } catch (error) {
            console.error('Failed to fetch inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault()
        const token = localStorage.getItem('token')
        try {
            await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newItem)
            })
            setShowAddModal(false)
            setNewItem({ name: '', category: 'STRUCTURAL', unit: 'PCS', quantity: 0, unitPrice: 0, minStock: 10, location: '' })
            fetchInventory()
        } catch (error) {
            console.error('Failed to add item:', error)
        }
    }

    const stats = {
        total: inventory.length,
        inStock: inventory.filter(i => i.quantity > i.minStock).length,
        lowStock: inventory.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length,
        outOfStock: inventory.filter(i => i.quantity === 0).length,
    }

    const filteredInventory = filter === 'all'
        ? inventory
        : filter === 'low'
            ? inventory.filter(i => i.quantity > 0 && i.quantity <= i.minStock)
            : filter === 'out'
                ? inventory.filter(i => i.quantity === 0)
                : inventory.filter(i => i.category === filter)

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Material Inventory</h1>
                    <p className="text-slate-500 mt-1">Manage your materials and supplies catalog</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchInventory}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Material
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Items" value={stats.total} icon={Package} color="blue" />
                <StatCard title="In Stock" value={stats.inStock} icon={CheckCircle2} color="green" />
                <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="orange" />
                <StatCard title="Out of Stock" value={stats.outOfStock} icon={Package} color="red" />
            </div>

            {/* Filter */}
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'low', label: 'Low Stock' },
                    { key: 'out', label: 'Out of Stock' },
                    { key: 'STRUCTURAL', label: 'Structural' },
                    { key: 'ELECTRICAL', label: 'Electrical' },
                    { key: 'CONSUMABLES', label: 'Consumables' },
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

            {/* Inventory Table */}
            {filteredInventory.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No materials found"
                    description="Add your first material to start managing inventory"
                    action={{
                        label: 'Add Material',
                        onClick: () => setShowAddModal(true)
                    }}
                />
            ) : (
                <DataTable
                    columns={[
                        { key: 'name', label: 'Material Name', sortable: true },
                        { key: 'category', label: 'Category', render: (val) => <StatusBadge status={val} /> },
                        {
                            key: 'quantity', label: 'Quantity', sortable: true, render: (val, row) => (
                                <span className={val <= row.minStock ? 'text-orange-600 font-bold' : ''}>
                                    {val} {row.unit}
                                </span>
                            )
                        },
                        { key: 'unitPrice', label: 'Unit Price', render: (val) => `₹${(val || 0).toLocaleString()}` },
                        { key: 'location', label: 'Location', render: (val) => val || '-' },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (_, row) => row.quantity === 0
                                ? <StatusBadge status="OUT_OF_STOCK" />
                                : row.quantity <= row.minStock
                                    ? <StatusBadge status="LOW_STOCK" />
                                    : <StatusBadge status="IN_STOCK" />
                        },
                    ]}
                    data={filteredInventory}
                    searchable={true}
                    searchKeys={['name', 'category', 'location']}
                    pageSize={10}
                />
            )}

            {/* Add Material Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Add Material</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Material Name *</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                    placeholder="e.g., Steel Pillars 10m"
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="STRUCTURAL">Structural</option>
                                        <option value="ELECTRICAL">Electrical</option>
                                        <option value="CONSUMABLES">Consumables</option>
                                        <option value="SAFETY">Safety</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit</label>
                                    <select
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    >
                                        <option value="PCS">Pieces</option>
                                        <option value="KG">Kilograms</option>
                                        <option value="TON">Tons</option>
                                        <option value="MTR">Meters</option>
                                        <option value="SQM">Square Meters</option>
                                        <option value="CUM">Cubic Meters</option>
                                        <option value="LTR">Liters</option>
                                        <option value="SET">Sets</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit Price (₹)</label>
                                    <input
                                        type="number"
                                        value={newItem.unitPrice}
                                        onChange={(e) => setNewItem({ ...newItem, unitPrice: parseInt(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Min Stock Alert</label>
                                    <input
                                        type="number"
                                        value={newItem.minStock}
                                        onChange={(e) => setNewItem({ ...newItem, minStock: parseInt(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={newItem.location}
                                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                        placeholder="Warehouse location"
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                                    Add Material
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
