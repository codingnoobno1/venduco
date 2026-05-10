'use client'

import React, { useState } from 'react'
import { 
    Users, 
    Shield, 
    UserPlus, 
    Trash2, 
    Edit, 
    ExternalLink, 
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    ChevronDown,
    Plus,
    User
} from 'lucide-react'

export default function VendorTeamsPage() {
    const [selectedTeam, setSelectedTeam] = useState<any>(null)

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Team Management</h1>
                    <p className="text-gray-400">Organize workers into efficient specialized teams</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all">
                    <Plus size={20} />
                    <span>Create New Team</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Team List */}
                <div className="lg:col-span-1 space-y-4">
                    {[
                        { name: 'Excavation Alpha', members: 12, supervisor: 'Ramesh Singh', status: 'ON_SITE' },
                        { name: 'Welding Elite', members: 8, supervisor: 'Vikram Rao', status: 'ON_SITE' },
                        { name: 'Civil Helpers B', members: 15, supervisor: 'Unassigned', status: 'IDLE' },
                    ].map((team, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedTeam(team)}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                                selectedTeam?.name === team.name 
                                ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-900/20' 
                                : 'bg-[#111] border-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg">{team.name}</h3>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    team.status === 'ON_SITE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {team.status}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Users size={14} /> {team.members} Members</span>
                                <span className="flex items-center gap-1"><Shield size={14} /> {team.supervisor}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Team Details / Member Management */}
                <div className="lg:col-span-2">
                    {selectedTeam ? (
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 sticky top-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                                    <p className="text-gray-500 mt-1">Project: Mumbai Metro Line 4 - Section 2</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"><Edit size={20} /></button>
                                    <button className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={20} /></button>
                                </div>
                            </div>

                            {/* Supervisor Assignment */}
                            <div className="mb-10">
                                <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Team Supervisor</h4>
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg">
                                            {selectedTeam.supervisor.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{selectedTeam.supervisor}</p>
                                            <p className="text-sm text-gray-500">Contact: +91 99887 76655</p>
                                        </div>
                                    </div>
                                    <button className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline">
                                        Change Supervisor <ChevronDown size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Member List */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Team Members (12)</h4>
                                    <button className="flex items-center gap-2 text-indigo-400 text-sm font-bold hover:underline">
                                        <UserPlus size={16} /> Add Member
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">RK</div>
                                                <div>
                                                    <p className="text-sm font-bold">Raju Kumar</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Helper • Exp: 2 Years</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold">PRESENT</span>
                                                <button className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-gray-500">
                            <Users size={48} className="mb-4 opacity-20" />
                            <p>Select a team to manage members and supervisors</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
