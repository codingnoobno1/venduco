// PM Collaboration Overview Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    FolderKanban,
    Users,
    Clock,
    CheckCircle2,
    ArrowRight,
    Crown,
    Shield,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function CollaborationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [collaborations, setCollaborations] = useState<any[]>([])
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => {
        fetchCollaborations()
    }, [])

    async function fetchCollaborations() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/collaboration/invites?status=all', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setCollaborations(data.data || [])
                setPendingCount(data.counts?.pending || 0)
            }
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const activeCollabs = collaborations.filter(c => c.status === 'ACCEPTED')
    const pendingInvites = collaborations.filter(c => c.status === 'PENDING')

    if (loading) return <LoadingSkeleton type="card" count={4} />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    My Collaborations
                </h1>
                <p className="text-slate-500 mt-1">Projects where you collaborate with other PMs</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Active Collaborations"
                    value={activeCollabs.length}
                    icon={FolderKanban}
                    color="blue"
                />
                <StatCard
                    title="Pending Invites"
                    value={pendingCount}
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="Total Projects"
                    value={collaborations.length}
                    icon={Users}
                    color="green"
                />
            </div>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="text-yellow-600" size={18} />
                        Pending Invitations ({pendingInvites.length})
                    </h3>
                    <div className="space-y-2">
                        {pendingInvites.map((invite) => (
                            <Link
                                key={invite._id}
                                href={`/dashboard/pm/collaboration/invites`}
                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300"
                            >
                                <div>
                                    <p className="font-medium">{invite.projectName}</p>
                                    <p className="text-sm text-slate-500">
                                        Invited by {invite.invitedByName}
                                    </p>
                                </div>
                                <ArrowRight size={18} className="text-slate-400" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Collaborations */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600" />
                        Active Collaborations
                    </h2>
                </div>

                {activeCollabs.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={Users}
                            title="No active collaborations"
                            description="You'll see projects here when other PMs invite you to collaborate"
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {activeCollabs.map((collab) => (
                            <motion.div
                                key={collab._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                                            <FolderKanban size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{collab.projectName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Shield size={12} />
                                                    {collab.role === 'ADMIN_PM' ? 'Admin' : 'Collaborator'}
                                                </span>
                                                <span>•</span>
                                                <span>{collab.permissions?.length || 0} permissions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/dashboard/pm/projects/${collab.projectId}`}
                                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium"
                                    >
                                        View Project
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
