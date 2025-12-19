// Guest/Read-only Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FolderKanban,
    Megaphone,
    Eye,
    TrendingUp,
    MapPin,
    Calendar,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

export default function GuestDashboard() {
    const [projects, setProjects] = useState<any[]>([])
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch public/assigned projects
            const projectsRes = await fetch('/api/projects/my', { headers })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])

            // Fetch announcements
            const announcementsRes = await fetch('/api/announcements', { headers })
            const announcementsData = await announcementsRes.json()
            setAnnouncements(announcementsData.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton type="stat" count={3} />
                <LoadingSkeleton type="card" count={3} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 mt-1">View project updates and announcements</p>
            </div>

            {/* Read-only Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Eye className="text-blue-600 dark:text-blue-400" size={24} />
                    <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Read-Only Access</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            You have view-only access to assigned projects and public announcements.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Visible Projects"
                    value={projects.length}
                    icon={FolderKanban}
                    color="blue"
                />
                <StatCard
                    title="Announcements"
                    value={announcements.length}
                    icon={Megaphone}
                    color="purple"
                />
                <StatCard
                    title="Active Updates"
                    value={projects.filter(p => p.status === 'ACTIVE').length}
                    icon={TrendingUp}
                    color="green"
                />
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Megaphone size={20} />
                            Announcements
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {announcements.slice(0, 5).map((announcement) => (
                            <div key={announcement._id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">
                                            {announcement.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {announcement.content}
                                        </p>
                                    </div>
                                    <StatusBadge status={announcement.priority || 'NORMAL'} />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Updates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <motion.div
                            key={project._id}
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{project.name}</h4>
                                    {project.projectCode && (
                                        <p className="text-sm text-slate-500">{project.projectCode}</p>
                                    )}
                                </div>
                                <StatusBadge status={project.status} />
                            </div>

                            {project.location && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                    <MapPin size={14} />
                                    <span>{project.location}</span>
                                </div>
                            )}

                            {typeof project.progress === 'number' && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Progress</span>
                                        <span className="font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {project.deadline && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar size={12} />
                                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-3 bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                            <Eye size={48} className="mx-auto mb-2 text-slate-400" />
                            <p className="text-slate-500">No projects assigned to view</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
