// Vendor Card Component
"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Building2,
    MapPin,
    Briefcase,
    Star,
    Truck,
    CheckCircle2,
} from 'lucide-react'

interface VendorCardProps {
    vendor: {
        _id: string
        name: string
        businessName?: string
        city?: string
        state?: string
        yearsOfOperation?: number
        serviceCategories?: string[]
        avatar?: string
        stats?: {
            machineCount?: number
            successRate?: number
        }
    }
    showActions?: boolean
    onInvite?: (vendorId: string) => void
    isInvited?: boolean
}

export function VendorCard({ vendor, showActions = true, onInvite, isInvited }: VendorCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {vendor.name?.[0]?.toUpperCase() || 'V'}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{vendor.name}</h3>
                    {vendor.businessName && (
                        <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
                            <Building2 size={12} />
                            {vendor.businessName}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {(vendor.city || vendor.state) && (
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                        <MapPin size={14} />
                        {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                    </p>
                )}
                {vendor.yearsOfOperation && (
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                        <Briefcase size={14} />
                        {vendor.yearsOfOperation} years experience
                    </p>
                )}
            </div>

            {/* Stats Row */}
            {vendor.stats && (
                <div className="mt-3 flex gap-4 text-sm">
                    {vendor.stats.machineCount !== undefined && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Truck size={14} />
                            {vendor.stats.machineCount} machines
                        </span>
                    )}
                    {vendor.stats.successRate !== undefined && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Star size={14} />
                            {vendor.stats.successRate}% success
                        </span>
                    )}
                </div>
            )}

            {/* Service Tags */}
            {vendor.serviceCategories && vendor.serviceCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {vendor.serviceCategories.slice(0, 3).map((cat) => (
                        <span
                            key={cat}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                        >
                            {cat}
                        </span>
                    ))}
                    {vendor.serviceCategories.length > 3 && (
                        <span className="text-xs text-slate-500">
                            +{vendor.serviceCategories.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                    <Link
                        href={`/dashboard/pm/vendors/${vendor._id}`}
                        className="flex-1 py-2 text-center border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        View Profile
                    </Link>
                    {onInvite && (
                        <button
                            onClick={() => onInvite(vendor._id)}
                            disabled={isInvited}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${isInvited
                                    ? 'bg-green-100 text-green-600 cursor-default'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {isInvited ? (
                                <>
                                    <CheckCircle2 size={14} />
                                    Invited
                                </>
                            ) : (
                                'Invite to Bid'
                            )}
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    )
}
