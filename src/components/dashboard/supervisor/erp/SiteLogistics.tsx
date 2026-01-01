"use client"

import { useState } from 'react'
import { Truck, Clock, Fuel, CheckCircle2, AlertTriangle, Play, Square } from 'lucide-react'
import { motion } from 'framer-motion'

export function SiteLogistics({ projectId }: { projectId: string }) {
    const [activeMachines, setActiveMachines] = useState([
        { id: '1', name: 'JCB 3DX Backhoe', task: 'Excavation - SEC-01', operator: 'Rahul K.', runtime: '4.5h', status: 'RUNNING' },
        { id: '2', name: 'Tata Hitachi Zaxis', task: 'Pile Boring - SEC-01', operator: 'Suresh M.', runtime: '2.0h', status: 'IDLE' },
    ])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Machines', value: '12', icon: Truck, color: 'blue' },
                    { label: 'Avg Productivity', value: '7.2h/day', icon: Clock, color: 'emerald' },
                    { label: 'Active Rentals', value: '4', icon: AlertTriangle, color: 'orange' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Equipment Terminal</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Track runtime and log usage for all machines on site</p>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Truck size={14} />
                        Assign Machine
                    </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeMachines.map(machine => (
                        <div key={machine.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-3 h-3 rounded-full ${machine.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {machine.name}
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">ID: {machine.id}</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Layout size={14} className="text-blue-500" />
                                            {machine.task}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Users size={14} className="text-slate-400" />
                                            {machine.operator}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current Runtime</p>
                                    <p className="text-lg font-mono font-bold text-blue-600">{machine.runtime}</p>
                                </div>
                                <div className="flex gap-2">
                                    {machine.status === 'RUNNING' ? (
                                        <button className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 transition-colors tooltip" title="Stop & Log Usage">
                                            <Square size={18} fill="currentColor" />
                                        </button>
                                    ) : (
                                        <button className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-200 transition-colors">
                                            <Play size={18} fill="currentColor" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-slate-50/30 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800">
                    <button className="w-full py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all uppercase tracking-widest">
                        View All Historical Usage Logs
                    </button>
                </div>
            </div>
        </div>
    )
}

function Users({ size, className }: any) { return <span className={className}>👤</span> }
function Layout({ size, className }: any) { return <span className={className}>📋</span> }
