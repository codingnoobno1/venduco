// PM Collaborators Management Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Users,
    UserPlus,
    Search,
    Crown,
    Shield,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    Settings,
} from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function CollaboratorsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [adminPM, setAdminPM] = useState<any>(null)
    const [collaborators, setCollaborators] = useState<any[]>([])
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [pms, setPMs] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [inviting, setInviting] = useState(false)

    useEffect(() => {
        fetchCollaborators()
    }, [projectId])

    async function fetchCollaborators() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/collaborators`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setAdminPM(data.data.adminPM)
                setCollaborators(data.data.collaborators || [])
            }
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    async function searchPMs(query: string) {
        if (!query) return
        const token = localStorage.getItem('token')
        try {
            // Using admin users endpoint with role filter
            const res = await fetch(`/api/admin/users?role=PROJECT_MANAGER&search=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setPMs(data.data || [])
        } catch (error) {
            console.error('Failed to search PMs:', error)
        }
    }

    async function invitePM(userId: string) {
        setInviting(true)
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/projects/${projectId}/collaborators`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            fetchCollaborators()
            setShowInviteModal(false)
            setPMs([])
            setSearchQuery('')
        } catch (error) {
            console.error('Failed to invite:', error)
        } finally {
            setInviting(false)
        }
    }

    async function removeCollaborator(userId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/projects/${projectId}/collaborators/${userId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REMOVE' })
            })
            fetchCollaborators()
        } catch (error) {
            console.error('Failed to remove:', error)
        }
    }

    if (loading) return <LoadingSkeleton type="card" count={4} />

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
                            Project Collaborators
                        </h1>
                        <p className="text-slate-500 mt-1">Manage PM team for this project</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Invite PM
                </motion.button>
            </div>

            {/* Admin PM Card */}
            {adminPM && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                            {adminPM.userName?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{adminPM.userName}</h3>
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
                                    <Crown size={12} />
                                    Admin PM
                                </span>
                            </div>
                            <p className="text-sm text-slate-500">Project Creator - Full Control</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Collaborators List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Users size={18} />
                        Collaborator PMs ({collaborators.length})
                    </h2>
                </div>

                {collaborators.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={Users}
                            title="No collaborators yet"
                            description="Invite other PMs to collaborate on this project"
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {collaborators.map((collab) => (
                            <div key={collab._id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                                        {collab.userName?.[0]?.toUpperCase() || 'P'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{collab.userName}</p>
                                            <StatusBadge status={collab.status} />
                                        </div>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <Mail size={12} />
                                            {collab.userEmail}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Shield size={12} />
                                        {collab.permissions?.length || 0} permissions
                                    </span>
                                    {collab.status !== 'REMOVED' && (
                                        <button
                                            onClick={() => removeCollaborator(collab.userId)}
                                            className="px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Invite PM to Collaborate</h2>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search project managers..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    searchPMs(e.target.value)
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {pms.map((pm) => (
                                <div
                                    key={pm._id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    <div>
                                        <p className="font-medium">{pm.name}</p>
                                        <p className="text-sm text-slate-500">{pm.email}</p>
                                    </div>
                                    <button
                                        onClick={() => invitePM(pm._id)}
                                        disabled={inviting}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                        Invite
                                    </button>
                                </div>
                            ))}
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
