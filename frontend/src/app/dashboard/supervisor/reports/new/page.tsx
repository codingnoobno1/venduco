"use client"

import { useEffect, useMemo, useState } from 'react'
import { DailyReportForm } from '@/components/dashboard/supervisor/DailyReportForm'
import apiRequest from '@/lib/api'

interface ProjectOption {
    id: string
    name: string
}

function projectOptions(response: unknown): ProjectOption[] {
    const payload = response as { data?: unknown[] } | unknown[]
    const records = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []

    return records.flatMap(record => {
        if (!record || typeof record !== 'object') return []
        const item = record as Record<string, unknown>
        const id = typeof item.id === 'string' ? item.id : typeof item._id === 'string' ? item._id : ''
        const name = typeof item.name === 'string' ? item.name : typeof item.title === 'string' ? item.title : ''
        return id && name ? [{ id, name }] : []
    })
}

export default function NewReportPage() {
    const [projects, setProjects] = useState<ProjectOption[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiRequest<unknown>('/projects/assigned')
            .then(response => {
                const options = projectOptions(response)
                setProjects(options)
                setSelectedProjectId(options[0]?.id || '')
            })
            .catch(() => {
                setProjects([])
                setSelectedProjectId('')
            })
            .finally(() => setLoading(false))
    }, [])

    const selectedProject = useMemo(
        () => projects.find(project => project.id === selectedProjectId),
        [projects, selectedProjectId],
    )

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="mb-6 text-2xl font-bold text-slate-900">Submit Daily Report</h1>
            <div className="dashboard-panel p-6">
                {loading ? (
                    <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
                ) : projects.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-sm font-semibold text-slate-700">No assigned projects are available</p>
                        <p className="mt-1 text-xs text-slate-500">A project assignment is required before a daily report can be submitted.</p>
                    </div>
                ) : (
                    <>
                        <label className="mb-5 block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Project</span>
                            <select
                                value={selectedProjectId}
                                onChange={event => setSelectedProjectId(event.target.value)}
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            >
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </label>
                        {selectedProject && (
                            <DailyReportForm
                                projectId={selectedProject.id}
                                projectName={selectedProject.name}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

