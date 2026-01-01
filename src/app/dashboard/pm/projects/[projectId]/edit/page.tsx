// Edit Project Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectCreationWizard } from '@/components/dashboard/pm/ProjectCreationWizard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ArrowLeft } from 'lucide-react'

export default function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProject = async () => {
            const token = localStorage.getItem('token')
            try {
                const res = await fetch(`/api/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success) {
                    setProject(data.data)
                } else {
                    router.push('/dashboard/pm/projects')
                }
            } catch (error) {
                console.error('Failed to fetch project:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProject()
    }, [projectId, router])

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />
    }

    return (
        <div className="py-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Edit Project: {project?.name}
                </h1>
            </div>

            <ProjectCreationWizard
                projectId={projectId}
                initialData={{
                    ...project,
                    endDate: project.deadline // API uses deadline, wizard uses endDate
                }}
            />
        </div>
    )
}
