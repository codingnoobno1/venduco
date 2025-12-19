// Browse Open Projects for Bidding
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Search,
    MapPin,
    Calendar,
    DollarSign,
    Building2,
    Briefcase,
} from 'lucide-react'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { BidForm } from '@/components/dashboard/shared/BidForm'

export default function BrowseProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedProject, setSelectedProject] = useState<any>(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/bids/open', {
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

    const filteredProjects = projects.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return <LoadingSkeleton type="card" count={6} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Projects</h1>
                <p className="text-slate-500 mt-1">Find open projects and submit your bids</p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by name, location, or client..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No open projects"
                    description={search ? 'Try a different search term' : 'Check back later for new bidding opportunities'}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project._id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {project.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">{project.projectCode}</p>
                                </div>
                                <StatusBadge status={project.planningStatus || 'OPEN'} />
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    <span>{project.location || 'Location TBD'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 size={14} />
                                    <span>{project.clientName || 'Client TBD'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign size={14} />
                                    <span className="font-semibold text-emerald-600">
                                        ₹{(project.budget / 100000).toFixed(1)}L budget
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>
                                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} -
                                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedProject(project)}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm"
                                >
                                    Submit Bid
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Bid Form Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold">Submit Bid</h2>
                                <p className="text-sm text-slate-500">{selectedProject.name}</p>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <div className="p-6">
                            <BidForm
                                projectId={selectedProject._id}
                                projectName={selectedProject.name}
                                onSuccess={() => {
                                    setSelectedProject(null)
                                    router.push('/dashboard/vendor/bids')
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
