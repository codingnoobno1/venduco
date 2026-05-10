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
    Calendar
} from 'lucide-react'

export default function VendorLabourPage() {
    const [activeTab, setActiveTab] = useState<'jobs' | 'workers' | 'teams' | 'attendance'>('jobs')
    const [showCreateJob, setShowCreateJob] = useState(false)

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Workforce Command Center
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your labourers, teams, and active job openings</p>
                </div>
                <button 
                    onClick={() => setShowCreateJob(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus size={20} />
                    <span>Create Job Opening</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Workers', value: '142', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Active Teams', value: '12', icon: BadgeCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Open Jobs', value: '8', icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Idle Workers', value: '14', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-[#111] border border-white/5 p-6 rounded-2xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 mb-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'jobs', label: 'Job Openings' },
                    { id: 'workers', label: 'My Workforce' },
                    { id: 'teams', label: 'Managed Teams' },
                    { id: 'attendance', label: 'Attendance' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 text-sm font-medium transition-all relative ${
                            activeTab === tab.id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'jobs' && <JobsList />}
                {activeTab === 'workers' && <WorkforceList />}
                {activeTab === 'teams' && <TeamsList />}
                {activeTab === 'attendance' && <AttendanceView />}
            </div>
        </div>
    )
}

function JobsList() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4 flex-1">
                    <Search className="text-gray-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search jobs..." 
                        className="bg-transparent border-none outline-none text-white w-full"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><Filter size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1 block">Active Opening</span>
                                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">Need 15 Helpers - Metro Line 4</h3>
                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> Thane, MH</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> 8/15 Applied</span>
                                </div>
                            </div>
                            <button className="text-gray-500 hover:text-white transition-colors"><MoreVertical size={20} /></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-3 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase">Daily Wage</p>
                                <p className="font-bold text-lg">₹850</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase">Duration</p>
                                <p className="font-bold text-lg">45 Days</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="w-8 h-8 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center text-[10px] font-bold">RK</div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-[#111] bg-gray-700 flex items-center justify-center text-[10px] font-bold">+5</div>
                            </div>
                            <button className="flex items-center gap-2 text-blue-400 text-sm font-bold hover:underline">
                                View Applicants <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function WorkforceList() {
    return (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 font-medium">Worker Name</th>
                        <th className="px-6 py-4 font-medium">Skill Set</th>
                        <th className="px-6 py-4 font-medium">Location</th>
                        <th className="px-6 py-4 font-medium">Current Status</th>
                        <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">AK</div>
                                    <div>
                                        <p className="font-medium">Anil Kumar</p>
                                        <p className="text-xs text-gray-500">+91 98765 43210</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                    <span className="bg-blue-400/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">WELDER</span>
                                    <span className="bg-indigo-400/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold">FITTER</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">Mumbai South</td>
                            <td className="px-6 py-4">
                                <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Working
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"><Phone size={18} /></button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"><MoreVertical size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function TeamsList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden border-t-4 border-t-indigo-500">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold">Alpha Strike Team</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} /> Site: Mumbai Metro L4</p>
                            </div>
                            <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-1 rounded-md font-bold">12 WORKERS</span>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-xl mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500 uppercase">Supervisor</span>
                                <span className="text-xs text-green-400 font-bold">ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">SK</div>
                                <div>
                                    <p className="text-sm font-bold">Sanjay Kumar</p>
                                    <p className="text-[10px] text-gray-500">Exp: 8 Years</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <button className="text-indigo-400 font-bold hover:underline">Manage Team</button>
                            <button className="text-gray-500 hover:text-white"><MoreVertical size={18} /></button>
                        </div>
                    </div>
                </div>
            ))}
            <button className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-all group">
                <div className="p-4 bg-white/5 rounded-full group-hover:bg-blue-500/10 transition-all">
                    <Plus size={32} />
                </div>
                <span className="font-bold">Create New Team</span>
            </button>
        </div>
    )
}

function AttendanceView() {
    return (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold">Live Attendance Feed</h3>
                    <p className="text-sm text-gray-500">Real-time check-in/out logs with geo-tagging</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-all">
                        <Calendar size={16} />
                        Today: 10th May
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <UserCheck className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="font-bold">Raju Kumar <span className="text-gray-500 font-normal text-sm">checked in</span></p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Clock size={12} /> 08:32 AM • <MapPin size={12} /> Entry Point A - Thane
                                </p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-blue-400 hover:underline">View Geo-Tag</button>
                    </div>
                ))}
            </div>
        </div>
    )
}
