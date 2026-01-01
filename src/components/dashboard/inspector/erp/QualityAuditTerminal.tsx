"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ShieldCheck,
    ClipboardCheck,
    AlertCircle,
    Camera,
    CheckCircle2,
    XCircle,
    Search,
    MapPin
} from 'lucide-react'

export function QualityAuditTerminal({ projectId }: { projectId: string }) {
    const [view, setView] = useState<'pending' | 'active_ncr'>('pending')
    const [requests, setRequests] = useState([
        { id: 'REQ-402', task: 'PILE_BORING', section: 'SEC-01', supervisor: 'Rahul K.', type: 'Physical Clearance' },
        { id: 'REQ-405', task: 'REBAR_FIXING', section: 'SEC-02', supervisor: 'Amit S.', type: 'Bending Audit' },
    ])

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setView('pending')}
                    className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${view === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                >
                    Pending Audits ({requests.length})
                </button>
                <button
                    onClick={() => setView('active_ncr')}
                    className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${view === 'active_ncr' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500'}`}
                >
                    Major NCRs
                </button>
            </div>

            {view === 'pending' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                            <Search size={14} /> Site Inspection Backlog
                        </h3>
                        {requests.map((req, i) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase">
                                                {req.type}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400">#{req.id}</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{req.task}</h4>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {req.section}</span>
                                            <span>Supervisor: {req.supervisor}</span>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 group-hover:scale-105">
                                        EXECUTE AUDIT
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                            <ClipboardCheck size={32} className="text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Checklist Terminal</h4>
                        <p className="text-xs text-slate-500 mt-2 max-w-[240px]">Select an inspection request to start the digital verification process</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 p-12 text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Critical Non-Conformities</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                        There are currently no critical quality departures reported by your team.
                        Safe project execution is proceeding.
                    </p>
                </div>
            )}
        </div>
    )
}
