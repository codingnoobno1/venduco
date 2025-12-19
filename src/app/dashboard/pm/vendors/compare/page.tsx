// PM Vendor Compare Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Search,
    Plus,
    X,
    CheckCircle2,
    Building2,
    MapPin,
    Truck,
    TrendingUp,
} from 'lucide-react'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function VendorComparePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [vendors, setVendors] = useState<any[]>([])
    const [compareVendors, setCompareVendors] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)

    async function searchVendors(query: string) {
        if (!query) return
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/vendors?search=${query}&limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setVendors(data.data || [])
        } catch (error) {
            console.error('Failed to search:', error)
        }
    }

    async function addVendor(vendorId: string) {
        if (compareVendors.length >= 3 || compareVendors.find(v => v._id === vendorId)) return

        const token = localStorage.getItem('token')
        try {
            const [profileRes, servicesRes] = await Promise.all([
                fetch(`/api/vendors/${vendorId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/vendors/${vendorId}/services`, { headers: { Authorization: `Bearer ${token}` } }),
            ])
            const profile = await profileRes.json()
            const services = await servicesRes.json()

            if (profile.success) {
                setCompareVendors(prev => [...prev, {
                    ...profile.data,
                    services: services.data
                }])
            }
        } catch (error) {
            console.error('Failed to add vendor:', error)
        }
        setShowSearch(false)
        setSearchQuery('')
        setVendors([])
    }

    function removeVendor(vendorId: string) {
        setCompareVendors(prev => prev.filter(v => v._id !== vendorId))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Compare Vendors
                    </h1>
                    <p className="text-slate-500 mt-1">Side-by-side vendor comparison</p>
                </div>
            </div>

            {/* Add Vendor */}
            {compareVendors.length < 3 && (
                <div className="relative">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center gap-2 hover:border-blue-500"
                    >
                        <Plus size={18} />
                        Add Vendor to Compare ({compareVendors.length}/3)
                    </button>

                    {showSearch && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-10"
                        >
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search vendors..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        searchVendors(e.target.value)
                                    }}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {vendors.map((vendor) => (
                                    <button
                                        key={vendor._id}
                                        onClick={() => addVendor(vendor._id)}
                                        disabled={compareVendors.find(v => v._id === vendor._id)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        <p className="font-medium">{vendor.name}</p>
                                        <p className="text-xs text-slate-500">{vendor.businessName}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Comparison Table */}
            {compareVendors.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500">Add vendors to compare their profiles</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="p-4 text-left font-semibold w-48">Attribute</th>
                                    {compareVendors.map((vendor) => (
                                        <th key={vendor._id} className="p-4 min-w-64">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">{vendor.name}</span>
                                                <button
                                                    onClick={() => removeVendor(vendor._id)}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                <tr>
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <Building2 size={16} /> Business
                                    </td>
                                    {compareVendors.map((vendor) => (
                                        <td key={vendor._id} className="p-4">{vendor.businessName || '-'}</td>
                                    ))}
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-900/30">
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <MapPin size={16} /> Location
                                    </td>
                                    {compareVendors.map((vendor) => (
                                        <td key={vendor._id} className="p-4">
                                            {vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : '-'}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <Truck size={16} /> Machines
                                    </td>
                                    {compareVendors.map((vendor) => (
                                        <td key={vendor._id} className="p-4">
                                            {vendor.stats?.machineCount || 0} total
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-900/30">
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <CheckCircle2 size={16} /> Approved Bids
                                    </td>
                                    {compareVendors.map((vendor) => (
                                        <td key={vendor._id} className="p-4">
                                            {vendor.stats?.approvedBids || 0} / {vendor.stats?.totalBids || 0}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <TrendingUp size={16} /> Success Rate
                                    </td>
                                    {compareVendors.map((vendor) => (
                                        <td key={vendor._id} className="p-4">
                                            <span className={`font-semibold ${(vendor.stats?.successRate || 0) >= 70 ? 'text-green-600' :
                                                    (vendor.stats?.successRate || 0) >= 40 ? 'text-yellow-600' : 'text-slate-500'
                                                }`}>
                                                {vendor.stats?.successRate || 0}%
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-900/30">
                                    <td className="p-4 font-medium">Services</td>
                                    {compareVendors.map((vendor) => (
                                        <td key={vendor._id} className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {vendor.serviceCategories?.slice(0, 3).map((cat: string) => (
                                                    <span key={cat} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
