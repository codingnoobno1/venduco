"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    ShieldAlert,
    TrendingUp,
    Clock,
    BarChart3,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'

export function PMControlCenter({ projectId }: { projectId: string }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'BOQ Burn Rate', value: '34.2%', trend: '+2.1%', up: true, icon: BarChart3, color: 'blue' },
                    { label: 'Critical NCRs', value: '3', trend: '-2', up: false, icon: ShieldAlert, color: 'red' },
                    { label: 'Inspection Pass Rate', value: '92%', trend: '+5%', up: true, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Delay Projection', value: '4 Days', trend: 'Stable', up: true, icon: Clock, color: 'orange' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-0.5 text-xs font-bold ${stat.up && stat.color === 'emerald' ? 'text-emerald-600' : stat.up && stat.color === 'red' ? 'text-red-600' : 'text-slate-500'}`}>
                                {stat.trend}
                                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h4>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* BOQ Burn Chart (Simplified Visual) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Baseline (BOQ Burn)</h3>
                            <p className="text-sm text-slate-500">Planned vs Consumed quantities across all sections</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-600" />
                                <span className="text-xs font-medium">Planned</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-xs font-medium">Consumed</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-3 px-4">
                        {[50, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full flex flex-col items-center gap-1">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative"
                                    >
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h * 0.7}%` }}
                                            className="w-full bg-blue-600/40 rounded-t-lg absolute bottom-0"
                                        />
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h * 0.4}%` }}
                                            className="w-full bg-emerald-500 rounded-t-lg absolute bottom-0"
                                        />
                                    </motion.div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">SEC-0{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quality Heatmap Context */}
                <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 overflow-hidden relative border border-slate-800">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <ShieldAlert className="text-red-500" />
                            Quality Risk Matrix
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">NCR density by section and severity</p>

                        <div className="mt-8 space-y-4">
                            {[
                                { name: 'SEC-04 (Bridges)', ncr: 2, severity: 'CRITICAL', color: 'red' },
                                { name: 'SEC-01 (Earthwork)', ncr: 5, severity: 'MINOR', color: 'emerald' },
                                { name: 'SEC-06 (Tunnels)', ncr: 1, severity: 'MAJOR', color: 'orange' },
                            ].map((item, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold">{item.name}</p>
                                        <p className="text-[10px] text-slate-500">{item.ncr} Active {item.ncr === 1 ? 'NCR' : 'NCRs'}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase text-${item.color}-400 border border-${item.color}-400/30 bg-${item.color}-400/10`}>
                                        {item.severity}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-400">Governance Integrity</span>
                                <span className="text-xs font-bold">Good (88%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[88%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    </div>

                    {/* Visual Flare */}
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    )
}
