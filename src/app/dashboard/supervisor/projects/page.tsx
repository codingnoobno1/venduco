// Supervisor Projects Page - View assigned projects
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    MapPin,
    Calendar,
    Users,
    TrendingUp,
    RefreshCw,
} from 'lucide-react'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'

export default function SupervisorProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/assigned', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setProjects(data.data || [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const activeProjects = projects.filter(p => p.status === 'ACTIVE')
    const avgProgress = projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
        : 0

    if (loading) {
        return <LoadingSkeleton type="card" count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Projects</h1>
                    <p className="text-slate-500 mt-1">Projects you're assigned to supervise</p>
                </div>
                <button
                    onClick={fetchProjects}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Projects" value={projects.length} icon={MapPin} color="blue" />
                <StatCard title="Active" value={activeProjects.length} icon={TrendingUp} color="green" />
                <StatCard title="Avg Progress" value={`${avgProgress.toFixed(0)}%`} icon={TrendingUp} color="purple" />
                <StatCard title="This Month Reports" value={projects.reduce((sum, p) => sum + (p.reportsThisMonth || 0), 0)} icon={Calendar} color="orange" />
            </div>

            {/* Projects */}
            {projects.length === 0 ? (
                <EmptyState
                    icon={MapPin}
                    title="No assigned projects"
                    description="You haven't been assigned to any projects yet. Contact your project manager."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                        <motion.div
                            key={project._id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => router.push(`/dashboard/supervisor/projects/${project._id}`)}
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{project.name}</h3>
                                    <p className="text-xs text-slate-500">{project.projectCode}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    <span>{project.location || 'Location TBD'}</span>
                                </div>
                            </div>

                            <ProgressBar
                                value={project.progress || 0}
                                label="Progress"
                                showLabel
                                color={project.progress >= 50 ? 'green' : 'blue'}
                            />

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs text-slate-500">
                                <span>{project.reportsSubmitted || 0} reports submitted</span>
                                <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
