'use client'

import React, { useState } from 'react'
import { 
    Shield, 
    Star, 
    Phone, 
    MessageSquare, 
    Award, 
    Calendar,
    ChevronRight,
    Search,
    Plus,
    UserCheck,
    History
} from 'lucide-react'

export default function VendorSupervisorsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                        Supervisor Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your site leads, performance, and team assignments</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20">
                    <Plus size={20} />
                    <span>Add Supervisor</span>
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Active Supervisors', value: '18', icon: Shield, color: 'text-indigo-400' },
                    { label: 'Avg Performance', value: '4.8/5', icon: Award, color: 'text-yellow-400' },
                    { label: 'Teams Supervised', value: '12', icon: UserCheck, color: 'text-green-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                        <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search supervisors by name or skill..." 
                        className="w-full bg-[#111] border border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Supervisor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Sanjay Kumar', exp: '8 Years', rating: 4.9, activeTeam: 'Excavation Alpha', projects: 24 },
                    { name: 'Vikram Rao', exp: '12 Years', rating: 4.7, activeTeam: 'Welding Elite', projects: 32 },
                    { name: 'Amit Singh', exp: '5 Years', rating: 4.8, activeTeam: 'None', projects: 12 },
                    { name: 'Rajesh Patil', exp: '10 Years', rating: 4.5, activeTeam: 'Civil Helpers B', projects: 28 },
                ].map((sup, i) => (
                    <div key={i} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-bold">
                                        {sup.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{sup.name}</h3>
                                        <p className="text-sm text-gray-500">{sup.exp} Experience</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                    <Star size={16} fill="currentColor" /> {sup.rating}
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Current Assignment</span>
                                    <span className={sup.activeTeam === 'None' ? 'text-gray-600' : 'text-indigo-400 font-bold'}>
                                        {sup.activeTeam}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Projects Completed</span>
                                    <span className="text-white font-bold">{sup.projects}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-bold transition-all">
                                    <History size={16} /> History
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all">
                                    <Phone size={16} /> Contact
                                </button>
                            </div>
                        </div>
                        <button className="w-full bg-white/[0.02] hover:bg-white/[0.05] py-3 text-xs text-gray-500 font-bold flex items-center justify-center gap-2 border-t border-white/5 transition-all">
                            View Full Performance Report <ChevronRight size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
