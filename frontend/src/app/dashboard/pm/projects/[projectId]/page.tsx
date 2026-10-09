"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit2,
    FileText,
    MapPin,
    MoreVertical,
    TrendingUp,
    Truck,
    Users,
    AlertTriangle,
    Activity,
    Shield
} from 'lucide-react'
import apiRequest from '@/lib/api'
import {
    MetricGrid,
    Panel,
    PrimaryButton,
    SecondaryButton,
    StatusPill,
    TabStrip,
    WorkspaceHeader,
    ProgressMeter,
    KeyValueList,
    field,
    formatMoney,
    formatDate,
    toneFor,
    SectionSkeleton
} from '@/components/dashboard/redesign/RedesignKit'
import ProjectControlSummary from '@/components/dashboard/redesign/ProjectControlSummary'
import ProjectLinkedRecords from '@/components/dashboard/redesign/ProjectLinkedRecords'
import { ActivityFeed } from '@/components/dashboard/shared/ActivityFeed'

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('Overview')

    useEffect(() => {
        fetchProject()
    }, [projectId])

    async function fetchProject() {
        try {
            const project = await apiRequest<any>(`/projects/${projectId}`)
            setProject(project)
        } catch (error) {
            console.error('Failed to fetch project:', error)
            setProject(null)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <SectionSkeleton />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <AlertTriangle className="mb-4 h-12 w-12 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-700">Project Not Found</h2>
                <p className="mt-2 text-sm text-slate-500">The project you are looking for does not exist or you lack permission to view it.</p>
                <div className="mt-6">
                    <PrimaryButton onClick={() => router.push('/dashboard/pm/projects')}>Return to Portfolio</PrimaryButton>
                </div>
            </div>
        )
    }

    // Progress is the share of package value already completed; it is absent until packages carry a value.
    const hasProgress = typeof project.progress === 'number'
    const progress = hasProgress ? project.progress : 0
    const delayedPackages = Number(project.delayedPackageCount) || 0
    const packageCount = Number(project.packageCount) || 0
    const sectionCount = Number(project.sectionCount) || 0

    const riskLevel = project.riskLevel || 'LOW'

    const tabs = ['Overview', 'Departments', 'Team', 'Reports', 'Bids', 'Documents']

    return (
        <div className="space-y-6 pb-20">
            {/* Context Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.back()}
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{project.name}</h1>
                            <StatusPill value={project.status} />
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${riskLevel === 'HIGH' ? 'bg-red-50 text-red-700' : riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                <Shield size={12} /> {riskLevel} RISK
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-700">
                                {project.projectCode || `PRJ-${projectId.substring(0, 6).toUpperCase()}`}
                            </span>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-400" />
                                {project.location || 'Location not specified'}
                            </span>
                            {project.clientName && (
                                <>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <span className="flex items-center gap-1.5">
                                        <Building2 size={14} className="text-slate-400" />
                                        {project.clientName}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <SecondaryButton onClick={() => router.push(`/dashboard/pm/projects/${projectId}/corridor`)}>
                        <Activity size={16} /> Corridor
                    </SecondaryButton>
                    <SecondaryButton onClick={() => router.push(`/dashboard/pm/projects/${projectId}/sections`)}>
                        <Users size={16} /> Sections
                    </SecondaryButton>
                    <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-4">
                        <SecondaryButton onClick={() => router.push(`/dashboard/pm/projects/${projectId}/edit`)}>
                            <Edit2 size={16} /> Edit
                        </SecondaryButton>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <TabStrip tabs={tabs} active={activeTab} onChange={setActiveTab} />

            {activeTab === 'Overview' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <MetricGrid items={[
                        {
                            label: 'Completed Work',
                            value: hasProgress ? `${progress}%` : '—',
                            detail: hasProgress ? 'Share of package value completed' : 'Add package values to track progress',
                            icon: TrendingUp,
                            tone: 'blue',
                            progress: hasProgress ? progress : undefined
                        },
                        {
                            label: 'Estimated Budget',
                            value: formatMoney(project.budget || 0),
                            detail: project.pmName ? `Project head: ${project.pmName}` : 'Project head not recorded',
                            icon: DollarSign,
                            tone: 'blue'
                        },
                        {
                            label: 'Corridor Structure',
                            value: `${packageCount} packages`,
                            detail: `${sectionCount} section${sectionCount === 1 ? '' : 's'}`,
                            icon: Users,
                            tone: 'violet'
                        },
                        {
                            label: 'Delayed Packages',
                            value: delayedPackages,
                            detail: delayedPackages ? 'Need recovery plans' : 'None delayed',
                            icon: FileText,
                            tone: delayedPackages > 1 ? 'red' : delayedPackages === 1 ? 'amber' : 'green'
                        },
                    ]} />

                    <div className="grid gap-6 xl:grid-cols-3">
                        {/* Main Detail Area */}
                        <div className="flex flex-col gap-6 xl:col-span-2">

                            {/* Project Banner (if available) */}
                            {project.imageUrl && (
                                <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                                    <img src={project.imageUrl} alt={project.name} className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <div className="flex items-center gap-4 text-white">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Start Date</span>
                                                <span className="font-semibold">{formatDate(project.startDate)}</span>
                                            </div>
                                            <div className="h-8 w-px bg-white/20"></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Deadline</span>
                                                <span className="font-semibold">{formatDate(project.deadline)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Panel title="Project Parameters" subtitle="Core contract and technical details">
                                <div className="p-0">
                                    <KeyValueList rows={[
                                        ['Project Type', <span className="capitalize" key="type">{String(project.projectType || 'Standard').toLowerCase()}</span>],
                                        ['Planning Status', project.planningStatus || 'Finalized'],
                                        ['Minimum Experience', `${project.minExperience || 0} Years Required`],
                                        ['Maintenance Period', `${project.maintenancePeriod || 0} Years`],
                                        ['Start Date', formatDate(project.startDate)],
                                        ['Completion Deadline', formatDate(project.deadline)],
                                    ]} />
                                    {project.description && (
                                        <div className="border-t border-slate-100 bg-slate-50/50 p-5 text-sm">
                                            <h4 className="mb-2 font-semibold text-slate-900">Project Scope</h4>
                                            <p className="leading-relaxed text-slate-600">{project.description}</p>
                                        </div>
                                    )}
                                </div>
                            </Panel>

                            <ProjectControlSummary projectId={projectId} />
                        </div>

                        {/* Sidebar Area */}
                        <div className="flex flex-col gap-6">

                            <Panel title="Package Progress" subtitle="Share of package value completed">
                                <div className="space-y-5 p-5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">Overall Completion</span>
                                        <span className="font-bold text-slate-900">{hasProgress ? `${progress}%` : '—'}</span>
                                    </div>
                                    <ProgressMeter value={progress} tone="blue" />

                                    <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Packages</p>
                                            <p className="mt-1 text-lg font-bold text-slate-900">{packageCount}
                                                <span className="text-sm font-normal text-slate-500"> in {sectionCount} section{sectionCount === 1 ? '' : 's'}</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Delayed</p>
                                            <p className={`mt-1 text-lg font-bold ${delayedPackages ? 'text-red-600' : 'text-emerald-600'}`}>{delayedPackages}</p>
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="Resource Allocation" subtitle="Currently deployed on site">
                                <div className="p-0">
                                    <KeyValueList rows={[
                                        ['Supervisors', <div key="sup" className="flex items-center gap-2"><Users size={14} className="text-blue-500" /> {project.supervisorsCount || 0}</div>],
                                        ['Subcontractors', <div key="ven" className="flex items-center gap-2"><Users size={14} className="text-violet-500" /> {project.vendorsCount || 0}</div>],
                                        ['Heavy Machinery', <div key="mac" className="flex items-center gap-2"><Truck size={14} className="text-amber-500" /> {project.machinesAssigned || 0}</div>],
                                    ]} />
                                </div>
                            </Panel>

                            <Panel title="Recent Activity" subtitle="Latest project updates" className="h-[400px] flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4">
                                    <ActivityFeed activities={project.activities || []} />
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Departments' && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {project.departments?.filter((d: any) => d.isSelected).length > 0 ? (
                        project.departments.filter((d: any) => d.isSelected).map((dept: any) => (
                            <Panel key={dept.name} title={dept.name} subtitle={`${dept.workPackages?.length || 0} Work Packages`}>
                                <div className="p-4 space-y-3">
                                    {dept.workPackages?.length > 0 ? (
                                        dept.workPackages.map((wp: any) => (
                                            <div key={wp.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-slate-900">{wp.name}</h4>
                                                    <StatusPill value={wp.status || 'ACTIVE'} />
                                                </div>
                                                {wp.budget && <p className="mt-2 text-xs text-slate-500">Budget: {formatMoney(wp.budget)}</p>}
                                                <div className="mt-3">
                                                    <ProgressMeter value={wp.progress || 0} tone="blue" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                            <p className="text-sm text-slate-500">No work packages active</p>
                                        </div>
                                    )}
                                </div>
                            </Panel>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                                <Building2 className="mb-3 h-8 w-8 text-slate-400" />
                                <h3 className="font-semibold text-slate-900">No Departments Assigned</h3>
                                <p className="mt-1 max-w-sm text-sm text-slate-500">There are no operational departments configured for this project yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Team' && (
                <ProjectLinkedRecords projectId={projectId} kind="team" />
            )}

            {activeTab === 'Reports' && (
                <ProjectLinkedRecords projectId={projectId} kind="reports" />
            )}

            {activeTab === 'Bids' && (
                <ProjectLinkedRecords projectId={projectId} kind="bids" />
            )}

            {activeTab === 'Documents' && (
                <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                    <FileText className="mb-3 h-10 w-10 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900">Document Repository</h3>
                    <p className="mt-1 max-w-md text-sm text-slate-500">The document management system will be integrated in the next release. For now, reference documents via reports.</p>
                </div>
            )}
        </div>
    )
}
