// Single Project View Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Edit2,
    Trash2,
    MapPin,
    Calendar,
    DollarSign,
    Users,
    Truck,
    FileText,
    MessageSquare,
    TrendingUp,
    Settings,
    MoreVertical,
    Building2,
    ShieldCheck,
    Beaker,
    Map as MapIcon,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { ActivityFeed } from '@/components/dashboard/shared/ActivityFeed'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { WorkPackageCard } from '@/components/dashboard/shared/WorkPackageCard'
import { BiddingControlPanel } from '@/components/dashboard/pm/BiddingControlPanel'
import { ERPOverview } from '@/components/dashboard/pm/erp/ERPOverview'
import { SectionManager } from '@/components/dashboard/pm/erp/SectionManager'
import { QualityCenter } from '@/components/dashboard/pm/erp/QualityCenter'
import { PMControlCenter } from '@/components/dashboard/pm/erp/PMControlCenter'
import { InvitationModal } from '@/components/dashboard/pm/InvitationModal'
import { StrategyControlRoom } from '@/components/dashboard/pm/StrategyControlRoom'
import { FinancialDashboard } from '@/components/dashboard/pm/FinancialDashboard'
import { UserPlus, UserCheck, Clock as ClockIcon } from 'lucide-react'

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])
    const [invitations, setInvitations] = useState<any[]>([])
    const [bids, setBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

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
                // Also fetch related data
                fetchMembers()
                fetchInvitations()
                fetchBids()
            } else {
                router.push('/dashboard/pm/projects')
            }
        } catch (error) {
            console.error('Failed to fetch project:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchMembers() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setMembers(data.data)
        } catch (err) {
            console.error('Failed to fetch members:', err)
        }
    }

    async function fetchInvitations() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/bidding/invitations`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setInvitations(data.data)
        } catch (err) {
            console.error('Failed to fetch invitations:', err)
        }
    }

    async function fetchBids() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/bids`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setBids(data.data)
        } catch (err) {
            console.error('Failed to fetch bids:', err)
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

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Project not found</p>
            </div>
        )
    }

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'control-tower', label: 'Control Tower' },
        { key: 'erp-overview', label: 'Weighted Progress' },
        { key: 'sections', label: 'Sections' },
        { key: 'quality', label: 'Quality & Governance' },
        { key: 'financials', label: 'Financials' },
        { key: 'strategy', label: 'Strategy' },
        { key: 'collaboration', label: 'Collaboration Hub' },
        { key: 'bidding', label: 'Bidding' },
        { key: 'team', label: 'Team' },
        { key: 'bids', label: 'Bids' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {project.name}
                            </h1>
                            <StatusBadge status={project.status} size="md" />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="font-mono">{project.projectCode}</span>
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {project.location}
                            </span>
                            {project.clientName && (
                                <span className="flex items-center gap-1">
                                    <Building2 size={14} />
                                    {project.clientName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/pm/projects/${projectId}/edit`)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Progress"
                    value={`${project.progress || 0}%`}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="Budget"
                    value={`₹${(project.budget / 100000).toFixed(1)}L`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Team"
                    value={(project.vendorsCount || 0) + (project.supervisorsCount || 0)}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Machines"
                    value={project.machinesAssigned || 0}
                    icon={Truck}
                    color="orange"
                />
                <StatCard
                    title="Pending Reports"
                    value={project.pendingReports || 0}
                    icon={FileText}
                    color={project.pendingReports > 0 ? 'orange' : 'green'}
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex gap-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Project Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Type</p>
                                    <p className="font-medium">{project.projectType || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Planning Status</p>
                                    <p className="font-medium">{project.planningStatus || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Start Date</p>
                                    <p className="font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Deadline</p>
                                    <p className="font-medium">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Min Experience</p>
                                    <p className="font-medium">{project.minExperience || 0} years</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Maintenance</p>
                                    <p className="font-medium">{project.maintenancePeriod || 0} years</p>
                                </div>
                            </div>
                            {project.description && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <p className="text-slate-500 text-sm">Description</p>
                                    <p className="text-sm mt-1">{project.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-semibold">Overall Progress</h3>
                                <span className="font-bold text-blue-600">{project.progress || 0}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress || 0}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>Milestones: {project.milestonesCompleted || 0}/{project.milestonesTotal || 0}</span>
                                <span>Budget Used: ₹{(project.budgetUsed || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity */}
                    <div>
                        <ActivityFeed
                            activities={[
                                { id: '1', type: 'report', title: 'Daily report submitted', timestamp: new Date().toISOString() },
                                { id: '2', type: 'bid', title: 'New bid received', timestamp: new Date(Date.now() - 3600000).toISOString() },
                            ]}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'control-tower' && (
                <PMControlCenter projectId={projectId} />
            )}

            {activeTab === 'erp-overview' && (
                <ERPOverview projectId={projectId} />
            )}

            {activeTab === 'sections' && (
                <SectionManager projectId={projectId} />
            )}

            {activeTab === 'quality' && (
                <QualityCenter projectId={projectId} />
            )}

            {activeTab === 'bidding' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bidding Controls</h3>
                        <button
                            onClick={() => router.push(`/dashboard/pm/projects/${projectId}/bidding`)}
                            className="text-sm text-blue-600 hover:underline font-medium"
                        >
                            Open Advanced Bidding Page
                        </button>
                    </div>
                    <BiddingControlPanel
                        settings={{
                            biddingMode: project.biddingMode || 'CLOSED',
                            biddingEnabled: project.biddingEnabled || false,
                            biddingStartDate: project.biddingStartDate?.split('T')[0],
                            biddingEndDate: project.biddingEndDate?.split('T')[0],
                        }}
                        onSettingsChange={async (newSettings) => {
                            const token = localStorage.getItem('token')
                            try {
                                const res = await fetch(`/api/projects/${projectId}/bidding`, {
                                    method: 'PUT',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(newSettings)
                                })
                                if (res.ok) fetchProject()
                            } catch (error) {
                                console.error('Failed to update bidding settings:', error)
                            }
                        }}
                        invitedCount={project.allowedVendorIds?.length || 0}
                    />
                </div>
            )}

            {activeTab === 'financials' && (
                <div className="space-y-6">
                    <FinancialDashboard projectId={projectId} />
                </div>
            )}

            {activeTab === 'strategy' && (
                <div className="space-y-6">
                    <StrategyControlRoom projectId={projectId} />
                </div>
            )}

            {activeTab === 'collaboration' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Project Team</h3>
                                <p className="text-sm text-slate-500">Manage all collaborators and vendors joined to this project</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
                        >
                            <UserPlus size={18} />
                            Invite Member
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Active Members */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                                <UserCheck size={18} className="text-blue-600" />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Active Members ({members.length})</h4>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {members.map(member => (
                                    <div key={member._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                {member.userName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{member.userName}</p>
                                                <p className="text-xs text-slate-500">{member.userEmail}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={member.role} />
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="p-8 text-center text-slate-400 text-sm">No members joined yet</p>
                                )}
                            </div>
                        </div>

                        {/* Pending Invitations */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                                <ClockIcon size={18} className="text-amber-500" />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Pending Invites ({invitations.length})</h4>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {invitations.filter(i => i.status === 'PENDING').map(invite => (
                                    <div key={invite._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold">{invite.vendorName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                                    {invite.targetRole || 'VENDOR'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono italic">
                                                    {invite.invitationType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400">Sent {new Date(invite.invitedAt).toLocaleDateString()}</p>
                                            <button className="text-[10px] font-bold text-red-600 hover:underline uppercase mt-1">Revoke</button>
                                        </div>
                                    </div>
                                ))}
                                {invitations.filter(i => i.status === 'PENDING').length === 0 && (
                                    <p className="p-8 text-center text-slate-400 text-sm">No pending invitations</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <InvitationModal
                        projectId={projectId}
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        onSuccess={() => {
                            fetchMembers()
                            fetchInvitations()
                        }}
                    />
                </div>
            )}

            {activeTab === 'team' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <DataTable
                        columns={[
                            { key: 'userName', label: 'Name', sortable: true },
                            { key: 'userEmail', label: 'Email' },
                            { key: 'role', label: 'Role', render: (val) => <StatusBadge status={val} /> },
                            { key: 'addedAt', label: 'Joined', render: (val) => new Date(val).toLocaleDateString() },
                        ]}
                        data={members.filter(m => m.role === 'VENDOR')}
                        pageSize={10}
                    />
                    {members.filter(m => m.role === 'VENDOR').length === 0 && (
                        <p className="p-8 text-center text-slate-500">No vendors joined yet</p>
                    )}
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 text-center py-8">Reports section coming soon</p>
                </div>
            )}

            {activeTab === 'bids' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <DataTable
                        columns={[
                            { key: 'bidderName', label: 'Bidder', sortable: true },
                            { key: 'companyName', label: 'Company' },
                            {
                                key: 'proposedAmount',
                                label: 'Amount',
                                render: (val) => `₹${val?.toLocaleString() || 0}`
                            },
                            { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                            {
                                key: 'actions',
                                label: '',
                                render: (_, row) => (
                                    <button
                                        onClick={() => router.push(`/dashboard/pm/bids/${row._id}`)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Review
                                    </button>
                                )
                            }
                        ]}
                        data={bids}
                        pageSize={10}
                    />
                    {bids.length === 0 && (
                        <p className="p-8 text-center text-slate-500">No bids submitted yet</p>
                    )}
                </div>
            )}
        </div>
    )
}
