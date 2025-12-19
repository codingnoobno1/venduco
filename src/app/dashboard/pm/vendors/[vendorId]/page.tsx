// PM Vendor Profile Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Building2,
    MapPin,
    Briefcase,
    Mail,
    Phone,
    Truck,
    CheckCircle2,
    Star,
    Calendar,
    Award,
    TrendingUp,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function VendorProfilePage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [vendor, setVendor] = useState<any>(null)
    const [services, setServices] = useState<any>(null)

    useEffect(() => {
        fetchVendor()
    }, [vendorId])

    async function fetchVendor() {
        const token = localStorage.getItem('token')
        try {
            const [profileRes, servicesRes] = await Promise.all([
                fetch(`/api/vendors/${vendorId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/vendors/${vendorId}/services`, { headers: { Authorization: `Bearer ${token}` } }),
            ])
            const profileData = await profileRes.json()
            const servicesData = await servicesRes.json()

            if (profileData.success) setVendor(profileData.data)
            if (servicesData.success) setServices(servicesData.data)
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <LoadingSkeleton type="card" count={4} />

    if (!vendor) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500">Vendor not found</p>
            </div>
        )
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
                        Vendor Profile
                    </h1>
                    <p className="text-slate-500 mt-1">View vendor details and capabilities</p>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold">
                        {vendor.name?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">{vendor.name}</h2>
                        {vendor.businessName && (
                            <p className="text-lg text-slate-500 flex items-center gap-2 mt-1">
                                <Building2 size={18} />
                                {vendor.businessName}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            {vendor.city && (
                                <span className="flex items-center gap-1 text-slate-500">
                                    <MapPin size={14} />
                                    {vendor.city}, {vendor.state}
                                </span>
                            )}
                            {vendor.yearsOfOperation && (
                                <span className="flex items-center gap-1 text-slate-500">
                                    <Briefcase size={14} />
                                    {vendor.yearsOfOperation} years in operation
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-500">
                                <Calendar size={14} />
                                Member since {new Date(vendor.createdAt).getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact Info (PM only) */}
                {vendor.email && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-6">
                        <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                            <Mail size={16} />
                            {vendor.email}
                        </a>
                        {vendor.phone && (
                            <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                                <Phone size={16} />
                                {vendor.phone}
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Machines"
                    value={vendor.stats?.machineCount || 0}
                    icon={Truck}
                    color="blue"
                />
                <StatCard
                    title="Total Bids"
                    value={vendor.stats?.totalBids || 0}
                    icon={Award}
                    color="purple"
                />
                <StatCard
                    title="Approved Bids"
                    value={vendor.stats?.approvedBids || 0}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Success Rate"
                    value={`${vendor.stats?.successRate || 0}%`}
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            {/* Service Categories */}
            {vendor.serviceCategories?.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-4">Service Categories</h3>
                    <div className="flex flex-wrap gap-2">
                        {vendor.serviceCategories.map((cat: string) => (
                            <span
                                key={cat}
                                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Machine Fleet */}
            {services?.machineCategories?.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Truck size={18} />
                        Machine Fleet
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.machineCategories.map((cat: any) => (
                            <div
                                key={cat.type}
                                className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                            >
                                <h4 className="font-medium">{cat.type}</h4>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-slate-500">Total</p>
                                        <p className="font-semibold">{cat.count}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Available</p>
                                        <p className="font-semibold text-green-600">{cat.available}</p>
                                    </div>
                                    {cat.avgDailyRate > 0 && (
                                        <div className="col-span-2">
                                            <p className="text-slate-500">Avg. Daily Rate</p>
                                            <p className="font-semibold">₹{cat.avgDailyRate.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Operating Regions */}
            {vendor.operatingRegions?.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={18} />
                        Operating Regions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {vendor.operatingRegions.map((region: string) => (
                            <span
                                key={region}
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm"
                            >
                                {region}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
