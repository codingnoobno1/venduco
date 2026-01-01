"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    FolderKanban,
    ClipboardCheck,
    AlertTriangle,
    User,
    CheckCircle
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function InspectorDashboard() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            const projectsRes = await fetch('/api/projects/my', { headers })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])
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
                <LoadingSkeleton type="card" count={2} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspector Dashboard</h1>
                    <p className="text-slate-500 mt-1">Quality control and safety inspections</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/profile')}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex items-center gap-2"
                    >
                        <User size={18} />
                        My Profile
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Assigned Projects"
                    value={projects.length}
                    icon={FolderKanban}
                    color="blue"
                />
                <StatCard
                    title="Pending Inspections"
                    value={0}
                    icon={ClipboardCheck}
                    color="orange"
                />
                <StatCard
                    title="Open NCRs"
                    value={0}
                    icon={AlertTriangle}
                    color="red"
                />
                <StatCard
                    title="Inspections Done"
                    value={0}
                    icon={CheckCircle}
                    color="green"
                />
            </div>

            {/* Projects */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onClick={() => router.push(`/dashboard/inspector/projects/${project._id}`)}
                        />
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                            <FolderKanban size={48} className="mx-auto mb-2 text-slate-400" />
                            <p className="text-slate-500">No projects assigned</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
