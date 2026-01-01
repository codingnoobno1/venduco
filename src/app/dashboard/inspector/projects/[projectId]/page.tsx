"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    ShieldCheck,
    FileCheck,
    AlertCircle,
    MapPin,
    Calendar,
    Users,
    ClipboardList,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { QualityAuditTerminal } from '@/components/dashboard/inspector/erp/QualityAuditTerminal'

export default function InspectorProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('audit')

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
            console.error('Failed to fetch project:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <LoadingSkeleton type="card" count={3} />
    if (!project) return <div className="text-center py-12">Project not found</div>

    const tabs = [
        { key: 'audit', label: 'Site Audit Terminal', icon: ShieldCheck },
        { key: 'history', label: 'My Inspections', icon: ClipboardList },
        { key: 'ncr', label: 'NCR Management', icon: AlertCircle },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded tracking-tighter uppercase font-mono">
                            QA/QC TERMINAL
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {project.location}</span>
                        <span className="font-mono">{project.projectCode}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Pending Audits" value="2" icon={ClipboardList} color="blue" />
                <StatCard title="In Review" value="5" icon={ShieldCheck} color="purple" />
                <StatCard title="Open NCRs" value="3" icon={AlertCircle} color="red" />
                <StatCard title="Passed Gate" value="12" icon={FileCheck} color="emerald" />
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.key ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'audit' && (
                <QualityAuditTerminal projectId={projectId} />
            )}

            {activeTab === 'history' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
                    <p className="text-slate-500">Inspection history coming soon</p>
                </div>
            )}

            {activeTab === 'ncr' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center text-red-500">
                    NCR management module - Blocked pending UI finalization
                </div>
            )}
        </div>
    )
}
