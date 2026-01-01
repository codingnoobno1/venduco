// PM Bidding Invitations Management Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Send,
    Search,
    UserPlus,
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    RefreshCw,
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function BiddingInvitationsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [invitations, setInvitations] = useState<any[]>([])
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [vendors, setVendors] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [inviting, setInviting] = useState(false)
    const [isDirectJoin, setIsDirectJoin] = useState(false)

    useEffect(() => {
        fetchInvitations()
    }, [projectId])

    async function fetchInvitations() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/bidding/invitations`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setInvitations(data.data || [])
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    async function searchVendors(query: string) {
        if (!query) return
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/vendors?search=${query}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setVendors(data.data || [])
        } catch (error) {
            console.error('Failed to search vendors:', error)
        }
    }

    async function inviteVendor(vendorId: string) {
        setInviting(true)
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/projects/${projectId}/bidding/invitations`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId,
                    invitationType: isDirectJoin ? 'MEMBER' : 'BID'
                })
            })
            fetchInvitations()
            setShowInviteModal(false)
            setVendors([])
            setSearchQuery('')
        } catch (error) {
            console.error('Failed to invite:', error)
        } finally {
            setInviting(false)
        }
    }

    async function cancelInvitation(inviteId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/projects/${projectId}/bidding/invitations/${inviteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchInvitations()
        } catch (error) {
            console.error('Failed to cancel:', error)
        }
    }

    const statusCounts = {
        pending: invitations.filter(i => i.status === 'PENDING').length,
        accepted: invitations.filter(i => i.status === 'ACCEPTED').length,
        declined: invitations.filter(i => i.status === 'DECLINED').length,
    }

    if (loading) return <LoadingSkeleton type="table" count={5} />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Vendor Invitations
                        </h1>
                        <p className="text-slate-500 mt-1">Invite vendors to bid on this project</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Invite Vendor
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 flex items-center gap-3">
                    <Clock className="text-yellow-600" size={24} />
                    <div>
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="text-xl font-bold">{statusCounts.pending}</p>
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="text-green-600" size={24} />
                    <div>
                        <p className="text-sm text-slate-500">Accepted</p>
                        <p className="text-xl font-bold">{statusCounts.accepted}</p>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-center gap-3">
                    <XCircle className="text-red-600" size={24} />
                    <div>
                        <p className="text-sm text-slate-500">Declined</p>
                        <p className="text-xl font-bold">{statusCounts.declined}</p>
                    </div>
                </div>
            </div>

            {/* Invitations Table */}
            {invitations.length === 0 ? (
                <EmptyState
                    icon={Send}
                    title="No invitations yet"
                    description="Invite vendors to allow them to bid on this project"
                    action={{ label: 'Invite Vendor', onClick: () => setShowInviteModal(true) }}
                />
            ) : (
                <DataTable
                    columns={[
                        { key: 'vendorName', label: 'Vendor', sortable: true },
                        { key: 'vendorEmail', label: 'Email' },
                        { key: 'invitedAt', label: 'Invited', render: (val) => new Date(val).toLocaleDateString() },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        {
                            key: 'actions',
                            label: '',
                            render: (_, row) => row.status === 'PENDING' && (
                                <button
                                    onClick={() => cancelInvitation(row._id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )
                        },
                        {
                            key: 'type',
                            label: 'Type',
                            render: (_, row) => (
                                <span className={`text-xs px-2 py-1 rounded-full ${row.invitationType === 'MEMBER'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {row.invitationType === 'MEMBER' ? 'Direct Join' : 'Bid to Join'}
                                </span>
                            )
                        }
                    ]}
                    data={invitations}
                    pageSize={10}
                />
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Invite Vendor to Bid</h2>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search vendors by name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    searchVendors(e.target.value)
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                            />
                        </div>

                        {/* Direct Join Toggle */}
                        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDirectJoin ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <UserPlus size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Direct Join</p>
                                        <p className="text-xs text-slate-500">Vendor skips bidding and joins team directly</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDirectJoin(!isDirectJoin)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${isDirectJoin ? 'bg-purple-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isDirectJoin ? 'right-0.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {vendors.map((vendor) => (
                                <div
                                    key={vendor._id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                                >
                                    <div>
                                        <p className="font-medium">{vendor.name}</p>
                                        <p className="text-sm text-slate-500">{vendor.businessName}</p>
                                    </div>
                                    <button
                                        onClick={() => inviteVendor(vendor._id)}
                                        disabled={inviting}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                        {inviting ? <RefreshCw size={14} className="animate-spin" /> : 'Invite'}
                                    </button>
                                </div>
                            ))}
                            {searchQuery && vendors.length === 0 && (
                                <p className="text-center text-slate-500 py-4">No vendors found</p>
                            )}
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
