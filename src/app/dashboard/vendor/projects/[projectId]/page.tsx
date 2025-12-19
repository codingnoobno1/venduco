// Vendor Project Detail Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    FolderKanban,
    MapPin,
    Calendar,
    Users,
    DollarSign,
    Clock,
    CheckCircle2,
    FileText,
    MessageSquare,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function VendorProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [project, setProject] = useState<any>(null)

    useEffect(() => {
        fetchProject()
    }, [projectId])

    async function fetchProject() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setProject(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <LoadingSkeleton type="card" count={4} />

    if (!project) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500">Project not found</p>
            </div>
        )
    }

    const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

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
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {project.name}
                        </h1>
                        <StatusBadge status={project.status} />
                    </div>
                    <p className="text-slate-500 mt-1">{project.projectCode}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Progress"
                    value={`${project.progress || 0}%`}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Days Remaining"
                    value={daysRemaining > 0 ? daysRemaining : 0}
                    icon={Clock}
                    color={daysRemaining < 7 ? 'red' : 'blue'}
                />
                <StatCard
                    title="Budget"
                    value={`₹${(project.budget / 100000).toFixed(1)}L`}
                    icon={DollarSign}
                    color="purple"
                />
                <StatCard
                    title="Pending Reports"
                    value={project.pendingReports || 0}
                    icon={FileText}
                    color="orange"
                />
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Project Progress</h3>
                    <span className="text-2xl font-bold text-blue-600">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                    />
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-2">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-4">Project Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-slate-400" size={18} />
                            <div>
                                <p className="text-sm text-slate-500">Location</p>
                                <p className="font-medium">{project.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="text-slate-400" size={18} />
                            <div>
                                <p className="text-sm text-slate-500">Timeline</p>
                                <p className="font-medium">
                                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.deadline).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="text-slate-400" size={18} />
                            <div>
                                <p className="text-sm text-slate-500">Project Manager</p>
                                <p className="font-medium">{project.pmName || project.pm?.name || 'Not assigned'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-4">Description</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        {project.description || 'No description available'}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    href={`/dashboard/vendor/projects/${projectId}/tasks`}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-center"
                >
                    <FileText className="mx-auto mb-2 text-blue-600" size={24} />
                    <p className="font-medium">My Tasks</p>
                </Link>
                <Link
                    href={`/dashboard/chat/${projectId}`}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-center"
                >
                    <MessageSquare className="mx-auto mb-2 text-green-600" size={24} />
                    <p className="font-medium">Chat</p>
                </Link>
                <Link
                    href={`/dashboard/vendor/fleet`}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-center"
                >
                    <FolderKanban className="mx-auto mb-2 text-purple-600" size={24} />
                    <p className="font-medium">My Fleet</p>
                </Link>
                <Link
                    href={`/dashboard/reports/${projectId}`}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-center"
                >
                    <CheckCircle2 className="mx-auto mb-2 text-amber-600" size={24} />
                    <p className="font-medium">Reports</p>
                </Link>
            </div>
        </div>
    )
}
