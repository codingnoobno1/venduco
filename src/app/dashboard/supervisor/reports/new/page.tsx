// Create New Daily Report Page - With project selector
"use client"

import { useState, useEffect } from 'react'
import { DailyReportForm } from '@/components/dashboard/supervisor/DailyReportForm'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function NewReportPage() {
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<any>(null)

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
            const projectList = data.data || []
            setProjects(projectList)
            if (projectList.length > 0) {
                setSelectedProject(projectList[0])
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={2} />
    }

    if (!selectedProject) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No projects assigned to you</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Submit Daily Report
            </h1>

            {projects.length > 1 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Project</label>
                    <select
                        value={selectedProject._id}
                        onChange={(e) => {
                            const proj = projects.find(p => p._id === e.target.value)
                            setSelectedProject(proj)
                        }}
                        className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    >
                        {projects.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <DailyReportForm
                    projectId={selectedProject._id}
                    projectName={selectedProject.name}
                />
            </div>
        </div>
    )
}
