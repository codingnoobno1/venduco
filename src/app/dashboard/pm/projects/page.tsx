// PM Projects List Page
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Plus,
    Search,
    Filter,
    Grid3X3,
    List,
    FolderKanban,
} from 'lucide-react'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function PMProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

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
            setProjects(data.data || [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = projects.filter(p => {
        const matchesFilter = filter === 'all' || p.status === filter
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.projectCode?.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const statusCounts = {
        all: projects.length,
        PLANNING: projects.filter(p => p.status === 'PLANNING').length,
        ACTIVE: projects.filter(p => p.status === 'ACTIVE').length,
        COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={6} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Projects</h1>
                    <p className="text-slate-500 mt-1">{projects.length} projects total</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/pm/projects/new')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Project
                </motion.button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Status Tabs */}
                <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'PLANNING', label: 'Planning' },
                        { key: 'ACTIVE', label: 'Active' },
                        { key: 'COMPLETED', label: 'Completed' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts]})
                        </button>
                    ))}
                </div>

                {/* Search & View Toggle */}
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm w-64"
                        />
                    </div>
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Display */}
            {filteredProjects.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <FolderKanban size={48} className="mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No projects found
                    </h3>
                    <p className="text-slate-500 mb-4">
                        {search ? 'Try a different search term' : 'Create your first project to get started'}
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/pm/projects/new')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Create Project
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onClick={() => router.push(`/dashboard/pm/projects/${project._id}`)}
                        />
                    ))}
                </div>
            ) : (
                <DataTable
                    columns={[
                        { key: 'projectCode', label: 'Code', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'location', label: 'Location' },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        { key: 'progress', label: 'Progress', render: (val) => `${val || 0}%` },
                        { key: 'deadline', label: 'Deadline', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
                    ]}
                    data={filteredProjects}
                    onRowClick={(row) => router.push(`/dashboard/pm/projects/${row._id}`)}
                    pageSize={10}
                />
            )}
        </div>
    )
}
