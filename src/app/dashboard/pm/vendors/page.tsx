// PM Vendor Discovery Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Search,
    Filter,
    Users,
    MapPin,
    Briefcase,
    Star,
    ChevronDown,
    Building2,
    Truck,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

const SERVICE_CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'MACHINERY', label: 'Machinery & Equipment' },
    { value: 'LABOUR', label: 'Labour & Manpower' },
    { value: 'MATERIALS', label: 'Construction Materials' },
    { value: 'TRANSPORT', label: 'Transport & Logistics' },
    { value: 'ELECTRICAL', label: 'Electrical Works' },
    { value: 'CIVIL', label: 'Civil Works' },
]

export default function VendorDiscoveryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [vendors, setVendors] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [category, setCategory] = useState('')
    const [region, setRegion] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })

    useEffect(() => {
        fetchVendors()
    }, [category, region, pagination.page])

    async function fetchVendors() {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (category) params.append('category', category)
            if (region) params.append('region', region)
            params.append('page', pagination.page.toString())
            params.append('limit', '12')

            const res = await fetch(`/api/vendors?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setVendors(data.data || [])
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination?.total || 0,
                    totalPages: data.pagination?.totalPages || 0
                }))
            }
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleSearch() {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchVendors()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Vendor Discovery
                    </h1>
                    <p className="text-slate-500 mt-1">Find vendors by their services and capabilities</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/pm/vendors/compare')}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    Compare Vendors
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, business..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                    >
                        Search
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2"
                    >
                        <Filter size={18} />
                        Filters
                        <ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} />
                    </button>
                </div>

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-4"
                    >
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Service Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                            >
                                {SERVICE_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Region</label>
                            <input
                                type="text"
                                placeholder="State/City"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{pagination.total} vendors found</span>
                <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
            </div>

            {/* Vendors Grid */}
            {loading ? (
                <LoadingSkeleton type="card" count={6} />
            ) : vendors.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No vendors found"
                    description="Try adjusting your search or filters"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendors.map((vendor) => (
                        <motion.div
                            key={vendor._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-lg font-bold">
                                    {vendor.name?.[0]?.toUpperCase() || 'V'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{vendor.name}</h3>
                                    {vendor.businessName && (
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <Building2 size={12} />
                                            {vendor.businessName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                {vendor.city && (
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <MapPin size={14} />
                                        {vendor.city}, {vendor.state}
                                    </p>
                                )}
                                {vendor.yearsOfOperation && (
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Briefcase size={14} />
                                        {vendor.yearsOfOperation} years experience
                                    </p>
                                )}
                            </div>

                            {vendor.serviceCategories?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {vendor.serviceCategories.slice(0, 3).map((cat: string) => (
                                        <span
                                            key={cat}
                                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                    {vendor.serviceCategories.length > 3 && (
                                        <span className="text-xs text-slate-500">
                                            +{vendor.serviceCategories.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            <Link
                                href={`/dashboard/pm/vendors/${vendor._id}`}
                                className="mt-4 block w-full py-2 text-center border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                View Profile
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
