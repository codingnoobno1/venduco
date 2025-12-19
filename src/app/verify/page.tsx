// Admin Verification Dashboard
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Users, CheckCircle, XCircle, Clock, RefreshCw,
    Building2, Briefcase, HardHat, Eye, Trash2, Shield
} from "lucide-react"

interface User {
    _id: string
    name: string
    email: string
    phone?: string
    registrationStatus: string
    requestedRole: string
    businessName?: string
    currentOrganization?: string
    city?: string
    state?: string
    submittedAt?: string
    createdAt: string
}

interface Counts {
    pending: number
    active: number
    rejected: number
    total: number
}

const roleIcons: Record<string, any> = {
    VENDOR: Building2,
    PROJECT_MANAGER: Briefcase,
    SUPERVISOR: HardHat,
    COMPANY_REP: Building2,
}

const roleColors: Record<string, string> = {
    VENDOR: "bg-blue-100 text-blue-700",
    PROJECT_MANAGER: "bg-purple-100 text-purple-700",
    SUPERVISOR: "bg-orange-100 text-orange-700",
    COMPANY_REP: "bg-green-100 text-green-700",
}

const statusColors: Record<string, string> = {
    PENDING_PROFILE: "bg-gray-100 text-gray-700",
    ROLE_DECLARED: "bg-yellow-100 text-yellow-700",
    DETAILS_COMPLETED: "bg-blue-100 text-blue-700",
    UNDER_VERIFICATION: "bg-orange-100 text-orange-700",
    ACTIVE: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
}

export default function VerifyDashboard() {
    const [users, setUsers] = useState<User[]>([])
    const [counts, setCounts] = useState<Counts>({ pending: 0, active: 0, rejected: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("UNDER_VERIFICATION")
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users?status=${filter}`)
            const data = await res.json()
            if (data.success) {
                setUsers(data.data)
                setCounts(data.counts)
            }
        } catch (err) {
            console.error("Failed to fetch users:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [filter])

    const handleAction = async (userId: string, action: string, extraData?: any) => {
        setActionLoading(userId)
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...extraData }),
            })
            const data = await res.json()
            if (data.success) {
                fetchUsers()
                setSelectedUser(null)
            } else {
                alert(data.message || "Action failed")
            }
        } catch (err) {
            alert("Network error")
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return

        setActionLoading(userId)
        try {
            const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                fetchUsers()
            } else {
                alert(data.message || "Delete failed")
            }
        } catch (err) {
            alert("Network error")
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-6 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Admin Verification Dashboard</h1>
                                <p className="text-blue-200 text-sm">Manage user registrations</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.pending}</p>
                                <p className="text-sm text-slate-500">Pending</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.active}</p>
                                <p className="text-sm text-slate-500">Approved</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.rejected}</p>
                                <p className="text-sm text-slate-500">Rejected</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.total}</p>
                                <p className="text-sm text-slate-500">Total Users</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { value: "UNDER_VERIFICATION", label: "Pending" },
                        { value: "ACTIVE", label: "Approved" },
                        { value: "REJECTED", label: "Rejected" },
                        { value: "ALL", label: "All Users" },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${filter === tab.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* User List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                            <p className="mt-2 text-slate-500">Loading...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                            <p className="text-slate-500">No users found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map((user) => {
                                const RoleIcon = roleIcons[user.requestedRole] || Users
                                return (
                                    <motion.div
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                                        {user.name}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.requestedRole] || 'bg-gray-100 text-gray-700'}`}>
                                                        {user.requestedRole?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                    <span>{user.businessName || user.currentOrganization || 'Individual'}</span>
                                                    <span>{user.city}, {user.state}</span>
                                                    <span className={`px-2 py-0.5 rounded-full ${statusColors[user.registrationStatus]}`}>
                                                        {user.registrationStatus?.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {user.registrationStatus === 'UNDER_VERIFICATION' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(user._id, 'APPROVE')}
                                                            disabled={actionLoading === user._id}
                                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(user._id, 'REJECT', { rejectionReason: 'Documents incomplete' })}
                                                            disabled={actionLoading === user._id}
                                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    disabled={actionLoading === user._id}
                                                    className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                                <p className="text-slate-500">{selectedUser.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Phone</p>
                                <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Location</p>
                                <p className="font-medium">{selectedUser.city}, {selectedUser.state}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Role</p>
                                <p className="font-medium">{selectedUser.requestedRole?.replace('_', ' ')}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Status</p>
                                <p className="font-medium">{selectedUser.registrationStatus?.replace(/_/g, ' ')}</p>
                            </div>
                        </div>

                        {/* Change Role */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Change Role:</p>
                            <div className="flex gap-2 flex-wrap">
                                {['VENDOR', 'PROJECT_MANAGER', 'SUPERVISOR', 'COMPANY_REP'].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => handleAction(selectedUser._id, 'CHANGE_ROLE', { role })}
                                        disabled={actionLoading === selectedUser._id}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${selectedUser.requestedRole === role
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {role.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {selectedUser.registrationStatus !== 'ACTIVE' && (
                                <button
                                    onClick={() => handleAction(selectedUser._id, 'APPROVE')}
                                    disabled={actionLoading === selectedUser._id}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    ✓ Approve
                                </button>
                            )}
                            {selectedUser.registrationStatus !== 'REJECTED' && (
                                <button
                                    onClick={() => handleAction(selectedUser._id, 'REJECT', { rejectionReason: 'Documents incomplete' })}
                                    disabled={actionLoading === selectedUser._id}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    ✗ Reject
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
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
