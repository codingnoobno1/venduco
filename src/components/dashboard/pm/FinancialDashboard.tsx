"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart3, ArrowUpRight } from 'lucide-react'

interface FinancialDashboardProps {
    projectId: string
}

export function FinancialDashboard({ projectId }: FinancialDashboardProps) {
    const [burnRate, setBurnRate] = useState<any>(null)
    const [cashFlow, setCashFlow] = useState<any>(null)
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFinancials()
    }, [projectId])

    async function fetchFinancials() {
        const token = localStorage.getItem('token')
        try {
            const [burnRes, cashRes, alertsRes] = await Promise.all([
                fetch(`/api/projects/${projectId}/financials/burn-rate`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`/api/projects/${projectId}/financials/cash-flow`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`/api/projects/${projectId}/financials/alerts`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            const [burnData, cashData, alertsData] = await Promise.all([
                burnRes.json(),
                cashRes.json(),
                alertsRes.json()
            ])

            if (burnData.success) setBurnRate(burnData.data)
            if (cashData.success) setCashFlow(cashData.data)
            if (alertsData.success) setAlerts(alertsData.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading financials...</div>

    return (
        <div className="space-y-6">
            {/* Header with Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Total Budget</p>
                            <p className="text-2xl font-bold mt-1">₹{((burnRate?.overall.totalBudget || 0) / 10000000).toFixed(2)}Cr</p>
                        </div>
                        <DollarSign className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Spent</p>
                            <p className="text-2xl font-bold mt-1 text-orange-600">₹{((burnRate?.overall.totalSpent || 0) / 10000000).toFixed(2)}Cr</p>
                        </div>
                        <TrendingUp className="text-orange-500" size={32} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Remaining</p>
                            <p className="text-2xl font-bold mt-1 text-green-600">₹{((burnRate?.overall.remaining || 0) / 10000000).toFixed(2)}Cr</p>
                        </div>
                        <TrendingDown className="text-green-500" size={32} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Utilization</p>
                            <p className="text-2xl font-bold mt-1">{burnRate?.overall.utilizationPercentage?.toFixed(1) || 0}%</p>
                        </div>
                        <BarChart3 className="text-purple-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Active Alerts */}
            {alerts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-red-600" size={20} />
                        <h3 className="font-bold text-red-900 dark:text-red-100">Cost Alerts ({alerts.length})</h3>
                    </div>
                    <div className="space-y-2">
                        {alerts.slice(0, 3).map(alert => (
                            <div key={alert._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-red-200 dark:border-red-700">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-sm">{alert.message}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Utilization: {alert.utilizationPercentage?.toFixed(1)}%
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                            alert.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {alert.severity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Section-wise Burn Rate Heatmap */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4">Section-wise Burn Rate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {burnRate?.sectionBurnRate?.map((section: any) => (
                        <div
                            key={section.sectionId}
                            className={`p-4 rounded-xl border-2 ${section.status === 'OVERRUN' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                                    section.status === 'CRITICAL' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                                        section.status === 'WARNING' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' :
                                            'border-green-500 bg-green-50 dark:bg-green-900/10'
                                }`}
                        >
                            <h4 className="font-bold text-sm mb-2">{section.sectionName}</h4>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Budget:</span>
                                    <span className="font-bold">₹{(section.budgeted / 100000).toFixed(1)}L</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Spent:</span>
                                    <span className="font-bold">₹{(section.spent / 100000).toFixed(1)}L</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Remaining:</span>
                                    <span className="font-bold">₹{(section.remaining / 100000).toFixed(1)}L</span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400">BURN RATE</span>
                                    <span className="text-xs font-bold">{section.utilizationPercentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${section.status === 'OVERRUN' ? 'bg-red-500' :
                                                section.status === 'CRITICAL' ? 'bg-orange-500' :
                                                    section.status === 'WARNING' ? 'bg-amber-500' :
                                                        'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(section.utilizationPercentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cash Flow Forecast */}
            {cashFlow && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4">6-Month Cash Flow Forecast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {cashFlow.monthlyForecasts?.map((month: any) => (
                            <div
                                key={month.month}
                                className={`p-3 rounded-xl border ${month.netPosition < 0
                                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                        : 'border-green-300 bg-green-50 dark:bg-green-900/10'
                                    }`}
                            >
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{month.month}</p>
                                <p className="text-xs text-slate-500">Inflow: ₹{(month.projectedInflow / 100000).toFixed(1)}L</p>
                                <p className="text-xs text-slate-500">Outflow: ₹{(month.projectedOutflow / 100000).toFixed(1)}L</p>
                                <p className={`text-sm font-bold mt-1 ${month.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {month.netPosition >= 0 ? '+' : ''}₹{(month.netPosition / 100000).toFixed(1)}L
                                </p>
                            </div>
                        ))}
                    </div>
                    {cashFlow.criticalMonths?.length > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                                ⚠️ Cash shortage expected in: {cashFlow.criticalMonths.join(', ')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
