"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface StrategyControlRoomProps {
    projectId: string
}

export function StrategyControlRoom({ projectId }: StrategyControlRoomProps) {
    const [strategies, setStrategies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStrategies()
    }, [projectId])

    async function fetchStrategies() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/strategies`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setStrategies(data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleApproval(strategyId: string, action: 'APPROVE' | 'REJECT') {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/projects/${projectId}/strategies`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, strategyId })
            })
            fetchStrategies()
        } catch (err) {
            console.error(err)
        }
    }

    const proposed = strategies.filter(s => s.status === 'PROPOSED')
    const approved = strategies.filter(s => s.status === 'APPROVED')

    if (loading) return <div className="p-8 text-center">Loading strategies...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                    <Target size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Strategy Control Room</h2>
                    <p className="text-sm text-slate-500">Govern high-level project execution decisions</p>
                </div>
            </div>

            {/* Pending Proposals */}
            {proposed.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} className="text-amber-600" />
                        <h3 className="font-bold">Pending Proposals ({proposed.length})</h3>
                    </div>
                    <div className="space-y-3">
                        {proposed.map(strategy => (
                            <motion.div
                                key={strategy._id}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-lg">{strategy.strategyCode.replace(/_/g, ' ')}</h4>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${strategy.riskLevel === 'LOW' ? 'bg-green-100 text-green-700' :
                                                    strategy.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                        strategy.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-red-100 text-red-700'
                                                }`}>
                                                {strategy.riskLevel} RISK
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{strategy.justification}</p>
                                        {strategy.sectionId && (
                                            <p className="text-xs text-slate-400 mt-1">Section: {strategy.sectionId}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => handleApproval(strategy._id, 'APPROVE')}
                                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={16} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleApproval(strategy._id, 'REJECT')}
                                        className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl font-bold flex items-center gap-2"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Strategies */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-green-600" />
                    <h3 className="font-bold">Active Strategies ({approved.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approved.map(strategy => (
                        <div
                            key={strategy._id}
                            className="p-4 rounded-2xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-bold text-sm">{strategy.strategyCode.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-slate-500 mt-1">{strategy.justification}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-green-600 font-bold uppercase bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded">
                                            {strategy.riskLevel}
                                        </span>
                                        {strategy.activeFrom && (
                                            <span className="text-[10px] text-slate-400">
                                                Since {new Date(strategy.activeFrom).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <CheckCircle2 size={18} className="text-green-600" />
                            </div>
                        </div>
                    ))}
                    {approved.length === 0 && (
                        <p className="col-span-2 text-center text-slate-400 py-8">No active strategies</p>
                    )}
                </div>
            </div>
        </div>
    )
}
