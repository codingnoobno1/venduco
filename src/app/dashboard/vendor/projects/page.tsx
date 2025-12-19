// Vendor Projects Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    FolderKanban,
    Clock,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Calendar,
    Users,
    TrendingUp,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function VendorProjectsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setProjects(data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const activeProjects = projects.filter(p => p.status === 'ACTIVE')
    const completedProjects = projects.filter(p => p.status === 'COMPLETED')

    if (loading) return <LoadingSkeleton type="card" count={4} />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    My Projects
                </h1>
                <p className="text-slate-500 mt-1">Projects where you are assigned as a vendor</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Projects"
                    value={projects.length}
                    icon={FolderKanban}
                    color="blue"
                />
                <StatCard
                    title="Active"
                    value={activeProjects.length}
                    icon={Clock}
                    color="green"
                />
                <StatCard
                    title="Completed"
                    value={completedProjects.length}
                    icon={CheckCircle2}
                    color="purple"
                />
                <StatCard
                    title="Avg Progress"
                    value={`${Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / (projects.length || 1))}%`}
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            {/* Projects List */}
            {projects.length === 0 ? (
                <EmptyState
                    icon={FolderKanban}
                    title="No projects yet"
                    description="You'll see projects here when you're assigned as a vendor"
                />
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <motion.div
                            key={project._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                        <FolderKanban size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{project.name}</h3>
                                            <StatusBadge status={project.status} />
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{project.projectCode}</p>
                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {project.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                Due: {new Date(project.deadline).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                Role: {project.myRole}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm text-slate-500 mb-2">Progress</div>
                                    <div className="text-2xl font-bold text-blue-600">{project.progress || 0}%</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                                        style={{ width: `${project.progress || 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-3">
                                <Link
                                    href={`/dashboard/vendor/projects/${project._id}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                >
                                    View Details
                                </Link>
                                <Link
                                    href={`/dashboard/vendor/projects/${project._id}/tasks`}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    My Tasks
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
