// PM Collaboration Invites Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    FolderKanban,
    User,
    Calendar,
} from 'lucide-react'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function CollaborationInvitesPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [invites, setInvites] = useState<any[]>([])
    const [responding, setResponding] = useState<string | null>(null)

    useEffect(() => {
        fetchInvites()
    }, [])

    async function fetchInvites() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/collaboration/invites?status=pending', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setInvites(data.data || [])
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    async function respondToInvite(inviteId: string, action: 'ACCEPT' | 'DECLINE') {
        setResponding(inviteId)
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/collaboration/invites/${inviteId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })
            fetchInvites()
        } catch (error) {
            console.error('Failed to respond:', error)
        } finally {
            setResponding(null)
        }
    }

    if (loading) return <LoadingSkeleton type="card" count={3} />

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
                        Collaboration Invites
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Pending invitations to collaborate on projects
                    </p>
                </div>
            </div>

            {/* Invites List */}
            {invites.length === 0 ? (
                <EmptyState
                    icon={Mail}
                    title="No pending invites"
                    description="You don't have any pending collaboration invitations"
                />
            ) : (
                <div className="space-y-4">
                    {invites.map((invite) => (
                        <motion.div
                            key={invite._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                                        <FolderKanban size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{invite.projectName}</h3>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <User size={14} />
                                                Invited by {invite.invitedByName}
                                            </p>
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(invite.invitedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {invite.inviteMessage && (
                                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                                "{invite.inviteMessage}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => respondToInvite(invite._id, 'ACCEPT')}
                                    disabled={responding === invite._id}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Accept
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => respondToInvite(invite._id, 'DECLINE')}
                                    disabled={responding === invite._id}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} />
                                    Decline
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
