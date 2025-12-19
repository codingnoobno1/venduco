// Admin Analytics Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    FolderKanban,
    Truck,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    RefreshCw,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        users: { total: 0, vendors: 0, supervisors: 0, pms: 0, pending: 0 },
        projects: { total: 0, active: 0, completed: 0, totalBudget: 0 },
        machines: { total: 0, available: 0, assigned: 0 },
        rentals: { total: 0, active: 0, revenue: 0 },
    })

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        const token = localStorage.getItem('token')
        try {
            // Fetch users
            const usersRes = await fetch('/api/admin/users?status=ALL', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const usersData = await usersRes.json()
            const users = usersData.data || []

            // Fetch projects
            const projectsRes = await fetch('/api/projects', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const projectsData = await projectsRes.json()
            const projects = projectsData.data || []

            // Fetch machines
            const machinesRes = await fetch('/api/machines', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const machinesData = await machinesRes.json()
            const machines = machinesData.data || []

            setStats({
                users: {
                    total: users.length,
                    vendors: users.filter((u: any) => u.role === 'VENDOR' || u.requestedRole === 'VENDOR').length,
                    supervisors: users.filter((u: any) => u.role === 'SUPERVISOR' || u.requestedRole === 'SUPERVISOR').length,
                    pms: users.filter((u: any) => u.role === 'PM' || u.requestedRole === 'PM').length,
                    pending: users.filter((u: any) => u.registrationStatus === 'UNDER_VERIFICATION' || u.registrationStatus === 'PENDING_VERIFICATION').length,
                },
                projects: {
                    total: projects.length,
                    active: projects.filter((p: any) => p.status === 'ACTIVE').length,
                    completed: projects.filter((p: any) => p.status === 'COMPLETED').length,
                    totalBudget: projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
                },
                machines: {
                    total: machines.length,
                    available: machines.filter((m: any) => m.status === 'AVAILABLE').length,
                    assigned: machines.filter((m: any) => m.status === 'ASSIGNED').length,
                },
                rentals: {
                    total: 0,
                    active: 0,
                    revenue: 0,
                },
            })
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSkeleton type="stat" count={8} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1">Platform-wide statistics and insights</p>
                </div>
                <button onClick={fetchStats} className="p-2 border rounded-xl hover:bg-slate-100">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.users.total} icon={Users} color="blue" />
                <StatCard title="Total Projects" value={stats.projects.total} icon={FolderKanban} color="green" />
                <StatCard title="Total Machines" value={stats.machines.total} icon={Truck} color="purple" />
                <StatCard title="Total Budget" value={`₹${(stats.projects.totalBudget / 10000000).toFixed(1)}Cr`} icon={DollarSign} color="orange" />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Users Breakdown
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Project Managers</span>
                                <span className="font-medium">{stats.users.pms}</span>
                            </div>
                            <ProgressBar value={(stats.users.pms / (stats.users.total || 1)) * 100} color="blue" size="sm" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Vendors</span>
                                <span className="font-medium">{stats.users.vendors}</span>
                            </div>
                            <ProgressBar value={(stats.users.vendors / (stats.users.total || 1)) * 100} color="green" size="sm" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Supervisors</span>
                                <span className="font-medium">{stats.users.supervisors}</span>
                            </div>
                            <ProgressBar value={(stats.users.supervisors / (stats.users.total || 1)) * 100} color="purple" size="sm" />
                        </div>
                        {stats.users.pending > 0 && (
                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                    <strong>{stats.users.pending}</strong> users pending verification
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Projects Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FolderKanban size={20} />
                        Projects Status
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-blue-600">{stats.projects.total}</p>
                            <p className="text-sm text-slate-500">Total</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-emerald-600">{stats.projects.active}</p>
                            <p className="text-sm text-slate-500">Active</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-purple-600">{stats.projects.completed}</p>
                            <p className="text-sm text-slate-500">Completed</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <ProgressBar
                            value={(stats.projects.completed / (stats.projects.total || 1)) * 100}
                            label="Completion Rate"
                            showLabel
                            color="green"
                        />
                    </div>
                </div>

                {/* Machines Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Truck size={20} />
                        Machine Fleet
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <p className="text-2xl font-bold">{stats.machines.total}</p>
                            <p className="text-sm text-slate-500">Total</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-emerald-600">{stats.machines.available}</p>
                            <p className="text-sm text-slate-500">Available</p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-orange-600">{stats.machines.assigned}</p>
                            <p className="text-sm text-slate-500">In Use</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <ProgressBar
                            value={(stats.machines.assigned / (stats.machines.total || 1)) * 100}
                            label="Utilization Rate"
                            showLabel
                            color="orange"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Activity size={20} />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <motion.a
                            href="/dashboard/admin/users"
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        >
                            <Users size={24} className="mx-auto text-blue-600 mb-2" />
                            <p className="text-sm font-medium">Manage Users</p>
                        </motion.a>
                        <motion.a
                            href="/dashboard/admin/projects"
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center hover:bg-green-100 dark:hover:bg-green-900/40"
                        >
                            <FolderKanban size={24} className="mx-auto text-green-600 mb-2" />
                            <p className="text-sm font-medium">View Projects</p>
                        </motion.a>
                        <motion.a
                            href="/dashboard/admin/machines"
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center hover:bg-purple-100 dark:hover:bg-purple-900/40"
                        >
                            <Truck size={24} className="mx-auto text-purple-600 mb-2" />
                            <p className="text-sm font-medium">Machine Fleet</p>
                        </motion.a>
                        <motion.a
                            href="/dashboard/admin/reports"
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center hover:bg-orange-100 dark:hover:bg-orange-900/40"
                        >
                            <Activity size={24} className="mx-auto text-orange-600 mb-2" />
                            <p className="text-sm font-medium">Reports</p>
                        </motion.a>
                    </div>
                </div>
            </div>
        </div>
    )
}
