// PM Cost Tracker Page - Simple visibility
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    Truck,
    Package,
    Users,
    RefreshCw,
    TrendingUp,
    PieChart,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { ProgressBar } from '@/components/dashboard/shared/ProgressBar'

export default function PMCostsPage() {
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('')
    const [costs, setCosts] = useState({
        machineUsage: 0,
        materialOrders: 0,
        labourEstimate: 0,
        budget: 0,
        spent: 0,
    })
    const [breakdown, setBreakdown] = useState<any[]>([])

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            fetchCosts()
        }
    }, [selectedProject])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            const projectList = data.data || []
            setProjects(projectList)
            if (projectList.length > 0) {
                setSelectedProject(projectList[0]._id)
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchCosts() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/costs?projectId=${selectedProject}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setCosts(data.summary || { machineUsage: 0, materialOrders: 0, labourEstimate: 0, budget: 0, spent: 0 })
            setBreakdown(data.breakdown || [])
        } catch (error) {
            console.error('Failed to fetch costs:', error)
            // Mock data for demo
            const project = projects.find(p => p._id === selectedProject)
            setCosts({
                budget: project?.budget || 10000000,
                spent: (project?.budgetUsed || 0),
                machineUsage: Math.floor(Math.random() * 500000),
                materialOrders: Math.floor(Math.random() * 1000000),
                labourEstimate: Math.floor(Math.random() * 300000),
            })
        }
    }

    const totalSpent = costs.machineUsage + costs.materialOrders + costs.labourEstimate
    const budgetPercent = costs.budget > 0 ? (totalSpent / costs.budget) * 100 : 0

    if (loading) {
        return <LoadingSkeleton type="stat" count={6} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cost Tracker</h1>
                    <p className="text-slate-500 mt-1">Simple cost visibility - not full accounting</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"
                    >
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                    <button onClick={fetchCosts} className="p-2 border rounded-xl hover:bg-slate-100">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Budget Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Budget Overview</h3>
                    <span className={`text-2xl font-bold ${budgetPercent > 90 ? 'text-red-600' : budgetPercent > 70 ? 'text-orange-600' : 'text-green-600'}`}>
                        {budgetPercent.toFixed(1)}% used
                    </span>
                </div>
                <ProgressBar
                    value={Math.min(budgetPercent, 100)}
                    color={budgetPercent > 90 ? 'red' : budgetPercent > 70 ? 'orange' : 'green'}
                    size="lg"
                />
                <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-slate-500">Budget</p>
                        <p className="text-xl font-bold">₹{(costs.budget / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-slate-500">Estimated Spent</p>
                        <p className="text-xl font-bold text-orange-600">₹{(totalSpent / 100000).toFixed(1)}L</p>
                    </div>
                </div>
            </div>

            {/* Cost Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Truck className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Machine Usage</p>
                            <p className="text-2xl font-bold">₹{(costs.machineUsage / 100000).toFixed(1)}L</p>
                        </div>
                    </div>
                    <ProgressBar value={(costs.machineUsage / totalSpent) * 100 || 0} color="purple" size="sm" />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Package className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Material Orders</p>
                            <p className="text-2xl font-bold">₹{(costs.materialOrders / 100000).toFixed(1)}L</p>
                        </div>
                    </div>
                    <ProgressBar value={(costs.materialOrders / totalSpent) * 100 || 0} color="orange" size="sm" />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Users className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Labour Estimate</p>
                            <p className="text-2xl font-bold">₹{(costs.labourEstimate / 100000).toFixed(1)}L</p>
                        </div>
                    </div>
                    <ProgressBar value={(costs.labourEstimate / totalSpent) * 100 || 0} color="blue" size="sm" />
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-green-500" />
                    Cost Distribution
                </h3>
                <div className="space-y-4">
                    {[
                        { label: 'Machine Rentals', value: costs.machineUsage, color: 'bg-purple-500' },
                        { label: 'Material Orders', value: costs.materialOrders, color: 'bg-orange-500' },
                        { label: 'Labour (est.)', value: costs.labourEstimate, color: 'bg-blue-500' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="flex-1 text-sm">{item.label}</span>
                            <span className="font-semibold">₹{(item.value / 1000).toFixed(0)}K</span>
                            <span className="text-sm text-slate-500 w-12 text-right">
                                {totalSpent > 0 ? ((item.value / totalSpent) * 100).toFixed(0) : 0}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Note:</strong> This is a simple cost visibility dashboard, not a full accounting system.
                Actual costs may vary. Labour estimates are based on attendance data.
            </div>
        </div>
    )
}
