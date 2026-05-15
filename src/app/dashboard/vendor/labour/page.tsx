'use client'

import React, { useState, useEffect } from 'react'
import { 
    Users, 
    Briefcase, 
    UserCheck, 
    Clock, 
    Plus, 
    MapPin, 
    BadgeCheck,
    Search,
    Filter,
    MoreVertical,
    ChevronRight,
    Home,
    Phone,
    Calendar,
    Utensils,
    Send
} from 'lucide-react'

export default function VendorLabourPage() {
    const [activeTab, setActiveTab] = useState<'jobs' | 'workers' | 'teams' | 'attendance' | 'applications'>('jobs')
    const [showCreateJob, setShowCreateJob] = useState(false)
    const [vendorId, setVendorId] = useState('')
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [stats, setStats] = useState({
        totalWorkers: 0,
        activeTeams: 0,
        openJobs: 0,
        idleWorkers: 0
    })

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                const vid = payload.userId
                setVendorId(vid)
                fetchStats(vid)
            } catch (e) {
                console.error('Failed to parse token:', e)
            }
        }
    }, [])

    async function fetchStats(vid: string) {
        try {
            const res = await fetch(`/api/vendor/analytics/workforce?vendorId=${vid}`)
            const data = await res.json()
            if (data.success) {
                setStats(data.data.summary)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Workforce Command Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your labourers, teams, and active job openings</p>
                </div>
                <button 
                    onClick={() => setShowCreateJob(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                    <Plus size={20} />
                    <span>Create Job Opening</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Workers', value: stats.totalWorkers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Active Teams', value: stats.activeTeams, icon: BadgeCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Open Jobs', value: stats.openJobs, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { label: 'Idle Workers', value: stats.idleWorkers, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'jobs', label: 'Job Openings' },
                    { id: 'applications', label: 'Applications' },
                    { id: 'workers', label: 'My Workforce' },
                    { id: 'teams', label: 'Managed Teams' },
                    { id: 'attendance', label: 'Attendance' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any)
                            if (tab.id !== 'applications') setSelectedJobId(null)
                        }}
                        className={`px-6 py-4 text-sm font-bold transition-all relative ${
                            activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'jobs' && (
                    <JobsList 
                        vendorId={vendorId} 
                        onViewDetails={(id) => {
                            setSelectedJobId(id)
                            setActiveTab('applications')
                        }}
                        key={showCreateJob ? 'refreshing' : 'stable'} 
                    />
                )}
                {activeTab === 'applications' && (
                    <ApplicationsList 
                        vendorId={vendorId} 
                        selectedJobId={selectedJobId}
                        onClearFilter={() => setSelectedJobId(null)}
                    />
                )}
                {activeTab === 'workers' && <WorkforceList />}
                {activeTab === 'teams' && <TeamsList vendorId={vendorId} />}
                {activeTab === 'attendance' && <AttendanceView />}
            </div>

            {/* Create Job Modal */}
            {showCreateJob && (
                <CreateJobModal 
                    onClose={() => setShowCreateJob(false)} 
                    vendorId={vendorId}
                />
            )}
        </div>
    )
}

function CreateJobModal({ onClose, vendorId }: { onClose: () => void, vendorId: string }) {
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        city: '',
        skillsRequired: '',
        salaryPerDay: '',
        duration: '',
        joiningDate: '',
        openings: '1',
        accommodation: false,
    })
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/vendor/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    vendorId,
                    skillsRequired: formData.skillsRequired.split(',').map(s => s.trim()),
                    salaryPerDay: Number(formData.salaryPerDay)
                })
            })
            const data = await res.json()
            if (data.success) {
                onClose()
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.error('Failed to create job:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Job Opening</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
                            <input 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                placeholder="e.g. Need 10 Welder Helpers"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Site Location</label>
                            <input 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                placeholder="e.g. Metro Site, Sector 5"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                            <input 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                placeholder="e.g. Mumbai"
                                value={formData.city}
                                onChange={e => setFormData({...formData, city: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Skills (Comma separated)</label>
                            <input 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                placeholder="Welder, Fitter, Helper"
                                value={formData.skillsRequired}
                                onChange={e => setFormData({...formData, skillsRequired: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Daily Wage (₹)</label>
                            <input 
                                required
                                type="number"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                placeholder="800"
                                value={formData.salaryPerDay}
                                onChange={e => setFormData({...formData, salaryPerDay: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Number of Openings</label>
                            <input 
                                required
                                type="number"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                placeholder="e.g. 5"
                                value={formData.openings}
                                onChange={e => setFormData({...formData, openings: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Duration</label>
                            <input 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                placeholder="e.g. 30 Days"
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Joining Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-white"
                                value={formData.joiningDate}
                                onChange={e => setFormData({...formData, joiningDate: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input 
                                type="checkbox"
                                id="accommodation"
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={formData.accommodation}
                                onChange={e => setFormData({...formData, accommodation: e.target.checked})}
                            />
                            <label htmlFor="accommodation" className="text-sm text-slate-600 dark:text-slate-400">Accommodation Provided</label>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading ? 'Publishing...' : <><Send size={18} /> Publish Opening</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function JobsList({ vendorId, onViewDetails }: { vendorId: string, onViewDetails: (id: string) => void }) {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (vendorId) fetchJobs()
    }, [vendorId])

    async function fetchJobs() {
        try {
            const res = await fetch(`/api/vendor/jobs?vendorId=${vendorId}`)
            const data = await res.json()
            if (data.success) setJobs(data.data)
        } catch (err) {
            console.error('Failed to fetch jobs:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-slate-500 py-12 text-center">Loading job openings...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <Search className="text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search jobs..." 
                        className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => (
                    <div key={job._id || job.jobId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-1 block">
                                    {job.status || 'Active Opening'}
                                </span>
                                <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors text-slate-900 dark:text-white">{job.title}</h3>
                                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> {job.applicationCount || 0} Applied</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Daily Wage</p>
                                <p className="font-bold text-lg text-slate-900 dark:text-white">₹{job.salaryPerDay}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Duration</p>
                                <p className="font-bold text-lg text-slate-900 dark:text-white">{job.duration}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-6 flex-wrap">
                            {job.accommodation && (
                                <span className="flex items-center gap-1.5 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold text-slate-600 dark:text-slate-400">
                                    <Home size={10} /> Accommodation
                                </span>
                            )}
                            {job.skillsRequired?.map((skill: string) => (
                                <span key={skill} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-bold uppercase">
                                    {skill}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-end">
                            <button 
                                onClick={() => onViewDetails(job._id)}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                            >
                                View Details <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && (
                    <div className="col-span-2 py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                        <Briefcase size={40} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500">No job openings published yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function WorkforceList() {
    const [workers, setWorkers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWorkers()
    }, [])

    async function fetchWorkers() {
        try {
            const res = await fetch('/api/vendor/workers')
            const data = await res.json()
            if (data.success) setWorkers(data.data)
        } catch (err) {
            console.error('Failed to fetch workers:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-slate-500 py-12 text-center">Loading workforce...</div>

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 font-bold">Worker Name</th>
                        <th className="px-6 py-4 font-bold">Skill Set</th>
                        <th className="px-6 py-4 font-bold">Location</th>
                        <th className="px-6 py-4 font-bold">Current Status</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {workers.map(worker => (
                        <tr key={worker._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                                        {worker.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{worker.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{worker.phone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                    {worker.labourSkills?.map((skill: string) => (
                                        <span key={skill} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{skill}</span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{worker.city}</td>
                            <td className="px-6 py-4">
                                <span className={`flex items-center gap-1.5 text-sm font-bold ${worker.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${worker.isAvailable ? 'bg-green-600 dark:bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
                                    {worker.isAvailable ? 'Available' : 'On Site'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Call Worker"><Phone size={18} /></button>
                                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 transition-colors" title="Invite to Job"><Send size={18} /></button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><MoreVertical size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function TeamsList({ vendorId }: { vendorId: string }) {
    const [teams, setTeams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (vendorId) fetchTeams()
    }, [vendorId])

    async function fetchTeams() {
        try {
            const res = await fetch(`/api/vendor/teams?vendorId=${vendorId}`)
            const data = await res.json()
            if (data.success) setTeams(data.data)
        } catch (err) {
            console.error('Failed to fetch teams:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-slate-500 py-12 text-center">Loading teams...</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teams.map(team => (
                <div key={team._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden border-t-4 border-t-indigo-500 shadow-sm transition-all hover:shadow-md">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{team.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1"><MapPin size={14} /> Site: {team.projectLocation || 'Unassigned'}</p>
                            </div>
                            <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{team.memberIds?.length || 0} WORKERS</span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Supervisor</span>
                                <span className="text-xs text-green-600 dark:text-green-400 font-bold">ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                    {team.leaderId?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{team.leaderId?.name || 'Unassigned'}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{team.leaderId?.phone || 'No Phone'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Manage Team</button>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><MoreVertical size={18} /></button>
                        </div>
                    </div>
                </div>
            ))}
            <button className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-600 hover:border-blue-500/50 transition-all group shadow-sm">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                    <Plus size={32} />
                </div>
                <span className="font-bold">Create New Team</span>
            </button>
        </div>
    )
}

function AttendanceView() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Live Attendance Feed</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Real-time check-in/out logs with geo-tagging</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                        <Calendar size={16} />
                        Today: 11th May
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <UserCheck className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Worker <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">checked in</span></p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock size={12} /> 08:32 AM • <MapPin size={12} /> Entry Point A - Thane
                                </p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View Geo-Tag</button>
                    </div>
                ))}
                    <p className="text-sm italic">Attendance logs are synced from the mobile worker application.</p>
            </div>
        </div>
    )
}

function ApplicationsList({ vendorId, selectedJobId, onClearFilter }: { vendorId: string, selectedJobId?: string | null, onClearFilter: () => void }) {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (vendorId) fetchApplications()
    }, [vendorId])

    async function fetchApplications() {
        try {
            const res = await fetch(`/api/vendor/jobs/applications?vendorId=${vendorId}`)
            const data = await res.json()
            if (data.success) setApplications(data.data)
        } catch (err) {
            console.error('Failed to fetch applications:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleAction(applicationId: string, status: string) {
        try {
            const res = await fetch(`/api/vendor/jobs/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (res.ok) fetchApplications()
        } catch (err) {
            console.error('Failed to update application:', err)
        }
    }

    if (loading) return <div className="text-slate-500 py-12 text-center">Loading applications...</div>

    const filteredApplications = selectedJobId 
        ? applications.filter(app => app.jobId?._id === selectedJobId)
        : applications

    return (
        <div className="space-y-4">
            {selectedJobId && (
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                        Showing applications for: <span className="font-bold">{filteredApplications[0]?.jobId?.title || 'Selected Job'}</span>
                    </p>
                    <button 
                        onClick={onClearFilter}
                        className="text-xs font-bold text-blue-600 hover:underline"
                    >
                        Show All Applications
                    </button>
                </div>
            )}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 font-bold">Applicant</th>
                        <th className="px-6 py-4 font-bold">Job Title</th>
                        <th className="px-6 py-4 font-bold">Base Wage</th>
                        <th className="px-6 py-4 font-bold">Bid Amount</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredApplications.map(app => (
                        <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-bold text-blue-600">
                                        {app.labourId?.name?.substring(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{app.labourId?.name || 'Unknown'}</p>
                                        <p className="text-[10px] text-slate-500">{app.labourId?.phone || 'No Phone'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{app.jobId?.title}</td>
                            <td className="px-6 py-4 text-sm font-medium">₹{app.jobId?.salaryPerDay}</td>
                            <td className="px-6 py-4">
                                <span className={`text-sm font-bold ${app.bidAmount > app.jobId?.salaryPerDay ? 'text-orange-600' : 'text-green-600'}`}>
                                    ₹{app.bidAmount}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                    app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {app.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {app.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAction(app._id, 'APPROVED')}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-lg transition-all"
                                        >
                                            Hire
                                        </button>
                                        <button 
                                            onClick={() => handleAction(app._id, 'REJECTED')}
                                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredApplications.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No applications found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
    )
}
