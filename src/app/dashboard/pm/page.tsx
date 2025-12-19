// Project Manager Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    FolderKanban,
    Users,
    FileText,
    DollarSign,
    Truck,
    Clock,
    AlertCircle,
    PlusCircle,
    TrendingUp,
    Calendar,
    MessageSquare,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { ActivityFeed } from '@/components/dashboard/shared/ActivityFeed'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { QuickAction } from '@/components/dashboard/shared/QuickAction'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

export default function PMDashboard() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([])
    const [pendingReports, setPendingReports] = useState<any[]>([])
    const [pendingBids, setPendingBids] = useState<any[]>([])
    const [rentalRequests, setRentalRequests] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        projects: 0,
        activeProjects: 0,
        pendingReports: 0,
        pendingBids: 0,
        teamMembers: 0,
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch my projects
            const projectsRes = await fetch('/api/projects/my', { headers })
            const projectsData = await projectsRes.json()
            const myProjects = projectsData.data || []
            setProjects(myProjects)

            // Fetch pending bids for my projects
            const bidsPromises = myProjects.slice(0, 3).map((p: any) =>
                fetch(`/api/projects/${p._id}/bids`, { headers }).then(r => r.json())
            )
            const bidsResults = await Promise.all(bidsPromises)
            const allBids = bidsResults.flatMap(r => r.data || []).filter((b: any) => b.status === 'SUBMITTED')
            setPendingBids(allBids.slice(0, 5))

            // Stats
            setStats({
                projects: myProjects.length,
                activeProjects: myProjects.filter((p: any) => p.status === 'ACTIVE').length,
                pendingReports: 5, // Placeholder
                pendingBids: allBids.length,
                teamMembers: myProjects.reduce((acc: number, p: any) =>
                    acc + (p.vendorsCount || 0) + (p.supervisorsCount || 0), 0
                ),
            })

            // Mock activities
            setActivities([
                { id: '1', type: 'report', title: 'Daily report received', description: 'From Supervisor Raj Kumar', timestamp: new Date().toISOString() },
                { id: '2', type: 'bid', title: 'New bid received', description: 'ABC Equipments - Metro CP-305', timestamp: new Date(Date.now() - 1800000).toISOString() },
                { id: '3', type: 'machine', title: 'Machine assigned', description: 'Crane TC-05 to Highway NH-48', timestamp: new Date(Date.now() - 3600000).toISOString() },
            ])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Manager Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your projects and team</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/pm/projects/new')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <PlusCircle size={18} />
                    New Project
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="My Projects" value={stats.projects} icon={FolderKanban} color="blue" />
                <StatCard title="Active" value={stats.activeProjects} icon={TrendingUp} color="green" />
                <StatCard title="Pending Reports" value={stats.pendingReports} icon={FileText} color="orange" />
                <StatCard title="Pending Bids" value={stats.pendingBids} icon={DollarSign} color="purple" />
                <StatCard title="Team Size" value={stats.teamMembers} icon={Users} color="blue" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickAction
                    title="Review Reports"
                    description={`${stats.pendingReports} pending`}
                    icon={FileText}
                    color="orange"
                    onClick={() => router.push('/dashboard/pm/reports')}
                />
                <QuickAction
                    title="Review Bids"
                    description={`${stats.pendingBids} new bids`}
                    icon={DollarSign}
                    color="green"
                    onClick={() => router.push('/dashboard/pm/bids')}
                />
                <QuickAction
                    title="Rent Machine"
                    description="Browse available"
                    icon={Truck}
                    color="blue"
                    onClick={() => router.push('/dashboard/pm/rentals')}
                />
                <QuickAction
                    title="Team Chat"
                    description="Project discussions"
                    icon={MessageSquare}
                    color="purple"
                    onClick={() => router.push('/dashboard/pm/chat')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Projects */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Projects</h3>
                        <a href="/dashboard/pm/projects" className="text-sm text-blue-600 hover:underline">View All</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.slice(0, 4).map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onClick={() => router.push(`/dashboard/pm/projects/${project._id}`)}
                            />
                        ))}
                        {projects.length === 0 && (
                            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                                <FolderKanban size={48} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-slate-500">No projects yet</p>
                                <button
                                    onClick={() => router.push('/dashboard/pm/projects/new')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                                >
                                    Create First Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity */}
                <div>
                    <ActivityFeed activities={activities} />
                </div>
            </div>

            {/* Pending Bids Table */}
            {pendingBids.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pending Bids</h3>
                    <DataTable
                        columns={[
                            { key: 'projectName', label: 'Project', sortable: true },
                            { key: 'bidderName', label: 'Bidder', sortable: true },
                            {
                                key: 'proposedAmount',
                                label: 'Amount',
                                render: (val) => `₹${val?.toLocaleString() || 0}`
                            },
                            {
                                key: 'requestedDays',
                                label: 'Duration',
                                render: (val) => `${val || 0} days`
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (val) => <StatusBadge status={val} />
                            },
                            {
                                key: 'actions',
                                label: '',
                                render: (_, row) => (
                                    <button
                                        onClick={() => router.push(`/dashboard/pm/bids/${row._id}`)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Review
                                    </button>
                                )
                            }
                        ]}
                        data={pendingBids}
                        searchable={false}
                        pageSize={5}
                    />
                </div>
            )}
        </div>
    )
}
