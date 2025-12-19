// Super Admin Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    FolderKanban,
    Truck,
    FileText,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Shield,
    TrendingUp,
    PlusCircle,
    Eye,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { ActivityFeed } from '@/components/dashboard/shared/ActivityFeed'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { QuickAction } from '@/components/dashboard/shared/QuickAction'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

interface DashboardStats {
    users: { total: number; pending: number; verified: number }
    projects: { total: number; active: number }
    machines: { total: number; available: number }
    reports: { pending: number; today: number }
    bids: { pending: number }
    rentals: { active: number }
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [pendingUsers, setPendingUsers] = useState<any[]>([])
    const [recentProjects, setRecentProjects] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    async function fetchDashboardData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch users
            const usersRes = await fetch('/api/admin/users', { headers })
            const usersData = await usersRes.json()
            const users = usersData.data || []

            // Fetch projects
            const projectsRes = await fetch('/api/projects', { headers })
            const projectsData = await projectsRes.json()
            const projects = projectsData.data || []

            // Fetch machines
            const machinesRes = await fetch('/api/machines', { headers })
            const machinesData = await machinesRes.json()
            const machines = machinesData.data || []

            // Calculate stats
            setStats({
                users: {
                    total: users.length,
                    pending: users.filter((u: any) => u.registrationStatus === 'PENDING_VERIFICATION').length,
                    verified: users.filter((u: any) => u.registrationStatus === 'APPROVED').length,
                },
                projects: {
                    total: projects.length,
                    active: projects.filter((p: any) => p.status === 'ACTIVE').length,
                },
                machines: {
                    total: machines.length,
                    available: machines.filter((m: any) => m.status === 'AVAILABLE').length,
                },
                reports: { pending: 5, today: 12 }, // Placeholder
                bids: { pending: 3 },
                rentals: { active: 4 },
            })

            setPendingUsers(users.filter((u: any) => u.registrationStatus === 'PENDING_VERIFICATION').slice(0, 5))
            setRecentProjects(projects.slice(0, 6))

            // Mock activities
            setActivities([
                { id: '1', type: 'user', title: 'New user registered', description: 'John Doe (Vendor)', timestamp: new Date().toISOString() },
                { id: '2', type: 'project', title: 'Project created', description: 'Metro CP-305', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: '3', type: 'report', title: 'Daily report submitted', description: 'Highway NH-48', timestamp: new Date(Date.now() - 7200000).toISOString() },
            ])
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleApproveUser(userId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'approve' })
            })
            fetchDashboardData()
        } catch (error) {
            console.error('Failed to approve user:', error)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton type="stat" count={4} />
                <LoadingSkeleton type="card" count={3} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        New Project
                    </motion.button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats?.users.total || 0}
                    icon={Users}
                    color="blue"
                    trend={{ value: 12, isUp: true }}
                />
                <StatCard
                    title="Active Projects"
                    value={stats?.projects.active || 0}
                    icon={FolderKanban}
                    color="green"
                />
                <StatCard
                    title="Available Machines"
                    value={stats?.machines.available || 0}
                    icon={Truck}
                    color="orange"
                />
                <StatCard
                    title="Pending Verifications"
                    value={stats?.users.pending || 0}
                    icon={Clock}
                    color="purple"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickAction
                    title="Pending Users"
                    description={`${stats?.users.pending || 0} awaiting verification`}
                    icon={Users}
                    color="purple"
                    onClick={() => window.location.href = '/dashboard/admin/users'}
                />
                <QuickAction
                    title="Review Bids"
                    description={`${stats?.bids.pending || 0} pending bids`}
                    icon={DollarSign}
                    color="green"
                    onClick={() => window.location.href = '/dashboard/admin/bids'}
                />
                <QuickAction
                    title="View Reports"
                    description={`${stats?.reports.pending || 0} pending review`}
                    icon={FileText}
                    color="orange"
                    onClick={() => window.location.href = '/dashboard/admin/reports'}
                />
                <QuickAction
                    title="Active Rentals"
                    description={`${stats?.rentals.active || 0} ongoing`}
                    icon={Truck}
                    color="blue"
                    onClick={() => window.location.href = '/dashboard/admin/rentals'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Users */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Pending Verifications
                            </h3>
                            <a href="/dashboard/admin/users" className="text-sm text-blue-600 hover:underline">
                                View All
                            </a>
                        </div>
                        {pendingUsers.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <CheckCircle2 size={48} className="mx-auto mb-2 text-emerald-500" />
                                <p>All users verified!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {pendingUsers.map((user) => (
                                    <div key={user._id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={user.requestedRole || 'VENDOR'} />
                                            <button
                                                onClick={() => handleApproveUser(user._id)}
                                                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div>
                    <ActivityFeed activities={activities} />
                </div>
            </div>

            {/* Recent Projects */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Projects</h3>
                    <a href="/dashboard/admin/projects" className="text-sm text-blue-600 hover:underline">
                        View All
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentProjects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onClick={() => window.location.href = `/dashboard/admin/projects/${project._id}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
