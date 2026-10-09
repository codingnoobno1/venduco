"use client"

import { useState } from 'react'
import { ShieldCheck, AlertCircle, FileText, CheckCircle2, MoreHorizontal, Plus, Camera } from 'lucide-react'
import { motion } from 'framer-motion'

export function QualityTerminal({ projectId }: { projectId: string }) {
    const [ncrs, setNcrs] = useState([
        { id: 'NCR-201', task: 'PILE_BORING', severity: 'CRITICAL', status: 'OPEN', description: 'Rebar cage misalignment detected' },
        { id: 'NCR-185', task: 'EARTHWORK', severity: 'MINOR', status: 'CLOSED', description: 'Dust suppression inadequate' },
    ])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active NCRs */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-red-50/30 dark:bg-red-900/10">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-600" size={20} />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Site Non-Conformance (NCR)</h3>
                        </div>
                        <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-red-600/20">
                            <Plus size={14} />
                            Report Issue
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {ncrs.map(ncr => (
                            <div key={ncr.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${ncr.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {ncr.severity}
                                            </span>
                                            <span className="text-xs font-mono text-slate-400">#{ncr.id}</span>
                                        </div>
                                        <h4 className="font-bold text-sm mt-1">{ncr.task}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{ncr.description}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold ${ncr.status === 'OPEN' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {ncr.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inspection Requests */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-blue-50/30 dark:bg-blue-900/10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-blue-600" size={20} />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Inspection Requests</h3>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">3 PENDING</span>
                    </div>
                    <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 dark:border-slate-700">
                            <Camera className="text-slate-400" size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Request Site Clearance</p>
                        <p className="text-xs text-slate-500 mt-1 mb-4">You can request inspection directly from the Task Board for finished work.</p>
                        <button className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">
                            View Inspection Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
