// Vendor Bid Invitations Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Mail,
    Clock,
    CheckCircle2,
    XCircle,
    MapPin,
    Calendar,
    DollarSign,
    ArrowRight,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorBidInvitationsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [invitations, setInvitations] = useState<any[]>([])
    const [responding, setResponding] = useState<string | null>(null)

    useEffect(() => {
        fetchInvitations()
    }, [])

    async function fetchInvitations() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/bids/invited?status=all', {
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

    async function respondToInvite(inviteId: string, projectId: string, action: 'ACCEPT' | 'DECLINE') {
        setResponding(inviteId)
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/projects/${projectId}/bidding/invitations/${inviteId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })
            fetchInvitations()
        } catch (error) {
            console.error('Failed to respond:', error)
        } finally {
            setResponding(null)
        }
    }

    const pendingInvites = invitations.filter(i => i.status === 'PENDING')
    const acceptedInvites = invitations.filter(i => i.status === 'ACCEPTED')

    if (loading) return <LoadingSkeleton type="card" count={3} />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Bid Invitations
                </h1>
                <p className="text-slate-500 mt-1">Projects where you're invited to submit bids</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Pending Invites"
                    value={pendingInvites.length}
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="Accepted"
                    value={acceptedInvites.length}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Total"
                    value={invitations.length}
                    icon={Mail}
                    color="blue"
                />
            </div>

            {/* Pending Invitations */}
            {pendingInvites.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="text-yellow-600" size={18} />
                        Pending Invitations ({pendingInvites.length})
                    </h3>
                    <div className="space-y-4">
                        {pendingInvites.map((invite) => (
                            <motion.div
                                key={invite._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg">{invite.projectName}</h4>
                                        <p className="text-sm text-slate-500">{invite.projectCode}</p>

                                        {invite.project && (
                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {invite.project.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={14} />
                                                    ₹{(invite.project.budget / 100000).toFixed(1)}L
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Due: {new Date(invite.project.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        {invite.message && (
                                            <p className="mt-3 text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                                "{invite.message}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => respondToInvite(invite._id, invite.projectId, 'ACCEPT')}
                                        disabled={responding === invite._id}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={18} />
                                        Accept & Submit Bid
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => respondToInvite(invite._id, invite.projectId, 'DECLINE')}
                                        disabled={responding === invite._id}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex items-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Decline
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Accepted Invitations */}
            {acceptedInvites.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CheckCircle2 className="text-green-600" size={18} />
                            Accepted Invitations
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {acceptedInvites.map((invite) => (
                            <div key={invite._id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{invite.projectName}</p>
                                    <p className="text-sm text-slate-500">{invite.projectCode}</p>
                                </div>
                                <Link
                                    href={`/dashboard/vendor/bids/${invite.projectId}/submit`}
                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    Submit Bid
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {invitations.length === 0 && (
                <EmptyState
                    icon={Mail}
                    title="No bid invitations"
                    description="You'll see invitations here when PMs invite you to bid on their projects"
                />
            )}
        </div>
    )
}
