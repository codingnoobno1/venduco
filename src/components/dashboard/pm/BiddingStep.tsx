// Bidding Step - Step 2 of Creation Wizard (New)
"use client"

import { motion } from 'framer-motion'
import {
    Gavel,
    Calendar,
    Lock,
    Globe,
    UserPlus,
    X,
    Check,
    PlusCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import type { ProjectFormData } from './ProjectCreationWizard'

interface BiddingStepProps {
    data: ProjectFormData
    onChange: (updates: Partial<ProjectFormData>) => void
}

export function BiddingStep({ data, onChange }: BiddingStepProps) {
    const biddingData = data as any
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.length >= 2) {
                performSearch()
            } else {
                setSearchResults([])
            }
        }, 500)

        return () => clearTimeout(delaySearch)
    }, [searchTerm])

    async function performSearch() {
        setIsSearching(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setIsSearching(false)
                return
            }

            const res = await fetch(`/api/vendors?q=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setSearchResults(data.data || [])
        } catch (error) {
            console.error('Vendor search failed:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const toggleVendor = (vendorId: string) => {
        const current = biddingData.allowedVendorIds || []
        const currentDirect = biddingData.directJoinVendorIds || []

        if (current.includes(vendorId)) {
            const updated = current.filter((id: string) => id !== vendorId)
            const updatedDirect = currentDirect.filter((id: string) => id !== vendorId)
            onChange({
                allowedVendorIds: updated,
                directJoinVendorIds: updatedDirect
            } as any)
        } else {
            onChange({
                allowedVendorIds: [...current, vendorId]
            } as any)
        }
    }

    const toggleDirectJoin = (vendorId: string) => {
        const currentDirect = biddingData.directJoinVendorIds || []
        const updatedDirect = currentDirect.includes(vendorId)
            ? currentDirect.filter((id: string) => id !== vendorId)
            : [...currentDirect, vendorId]
        onChange({ directJoinVendorIds: updatedDirect } as any)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    Bidding Controls
                </h2>
                <p className="text-slate-500 text-sm">
                    Configure how vendors can find and bid on this project
                </p>
            </div>

            <div className="space-y-6">
                {/* Bidding Mode */}
                <div>
                    <label className="block text-sm font-medium mb-3">Bidding Mode</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => onChange({ biddingMode: 'OPEN' } as any)}
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${biddingData.biddingMode === 'OPEN'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${biddingData.biddingMode === 'OPEN' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                }`}>
                                <Globe size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Open Bidding</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    All registered vendors can find and submit bids for this project.
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => onChange({ biddingMode: 'INVITE_ONLY' } as any)}
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${biddingData.biddingMode === 'INVITE_ONLY'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${biddingData.biddingMode === 'INVITE_ONLY' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                }`}>
                                <Lock size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Invite Only</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Only specific vendors you select can find and bid on this project.
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                            <Gavel size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Accepting Bids Immediately?</p>
                            <p className="text-xs text-slate-500">Enable to allow submissions as soon as project is published</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onChange({ biddingEnabled: !biddingData.biddingEnabled } as any)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${biddingData.biddingEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${biddingData.biddingEnabled ? 'right-1' : 'left-1'
                            }`} />
                    </button>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Calendar size={16} />
                            Bidding Start Date
                        </label>
                        <input
                            type="date"
                            value={biddingData.biddingStartDate || ''}
                            onChange={(e) => onChange({ biddingStartDate: e.target.value } as any)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Calendar size={16} />
                            Bidding End Date
                        </label>
                        <input
                            type="date"
                            value={biddingData.biddingEndDate || ''}
                            onChange={(e) => onChange({ biddingEndDate: e.target.value } as any)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                </div>

                {/* Invited Vendors */}
                {biddingData.biddingMode === 'INVITE_ONLY' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Search & Invite Vendors</label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by vendor name or business..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                                    </div>
                                )}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto z-10">
                                    {searchResults.map((vendor) => {
                                        const isSelected = biddingData.allowedVendorIds?.includes(vendor._id)
                                        return (
                                            <button
                                                key={vendor._id}
                                                onClick={() => toggleVendor(vendor._id)}
                                                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{vendor.businessName || vendor.name}</p>
                                                    <p className="text-xs text-slate-500">{vendor.city}, {vendor.state}</p>
                                                </div>
                                                {isSelected ? (
                                                    <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                                                        <Check size={14} />
                                                    </div>
                                                ) : (
                                                    <PlusCircle size={14} className="text-blue-500" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Selected Vendors List */}
                        {biddingData.allowedVendorIds?.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Invited Vendors ({biddingData.allowedVendorIds.length})
                                </p>
                                <div className="space-y-2">
                                    {biddingData.allowedVendorIds.map((id: string) => {
                                        const isDirect = biddingData.directJoinVendorIds?.includes(id)
                                        return (
                                            <div
                                                key={id}
                                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                                        <UserPlus size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Vendor ID: {id.substring(0, 8)}...</p>
                                                        <p className="text-xs text-slate-500">
                                                            {isDirect ? 'Will be invited for direct join' : 'Will be invited to bid'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium">Direct Join</span>
                                                        <button
                                                            onClick={() => toggleDirectJoin(id)}
                                                            className={`w-8 h-4 rounded-full transition-colors relative ${isDirect ? 'bg-purple-500' : 'bg-slate-300'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDirect ? 'right-0.5' : 'left-0.5'}`} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleVendor(id)}
                                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {!biddingData.allowedVendorIds?.length && !searchTerm && (
                            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                                <UserPlus size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-sm text-slate-500">
                                    Search for vendors above to invite them to this project.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
