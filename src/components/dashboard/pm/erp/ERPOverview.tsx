"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, BarChart3, Ruler } from 'lucide-react'
import { ChainageVisualizer } from '@/components/dashboard/shared/ChainageVisualizer'

interface ERPOverviewProps {
    projectId: string
}

export function ERPOverview({ projectId }: ERPOverviewProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProgress()
    }, [projectId])

    async function fetchProgress() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const json = await res.json()
            if (json.success) {
                setData(json.data)
            }
        } catch (error) {
            console.error('Failed to fetch ERP progress:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <TrendingUp className="text-blue-600" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                            Physical
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">Overall Weighted Progress</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {data.overallProgress}%
                    </h3>
                    <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.overallProgress}%` }}
                            className="h-full bg-blue-600 rounded-full"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                            <Ruler className="text-emerald-600" size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm">Route Completion</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {data.completedLengthKm} <span className="text-lg text-slate-400 font-medium">/ {data.totalLengthKm} KM</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-4">Weighted by linear chainage</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                            <AlertCircle className="text-amber-600" size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm">Continuity Alerts</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {data.sections.filter((s: any, i: number) => i > 0 && s.status === 'COMPLETED' && data.sections[i - 1].status !== 'COMPLETED').length}
                    </h3>
                    <p className="text-xs text-amber-500 mt-4 font-medium italic">Execution sequences out of chainage</p>
                </div>
            </div>

            {/* Visual Continuity Map */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Physical Continuity Map</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Linear project execution tracking across chainages</p>
                    </div>
                    <BarChart3 className="text-slate-400" size={18} />
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <ChainageVisualizer
                        sections={data.sections}
                        onSectionClick={(s) => console.log('Section clicked:', s)}
                    />
                </div>
            </div>
        </div>
    )
}
